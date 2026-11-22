from datetime import datetime
from flask import Blueprint, request, jsonify, g
from backend.database import SessionLocal
from backend.models import Business, User, SearchLog, ViewLog, Review
from backend.auth.utils import token_required, role_required, optional_token
from backend.ml.recommender import haversine_distance

businesses_bp = Blueprint('businesses', __name__, url_prefix='/api/businesses')

@businesses_bp.route('', methods=['GET'])
@optional_token
def list_businesses():
    """
    Search and filter businesses by category, keyword, and location radius.
    Also logs the search query for demand analytics.
    """
    category = request.args.get('category', '').strip()
    query = request.args.get('search', '').strip()
    lat = request.args.get('latitude', type=float)
    lon = request.args.get('longitude', type=float)
    radius_km = request.args.get('radius', type=float)  # in km, e.g. 5.0
    sort_by = request.args.get('sort', 'distance')  # 'distance', 'rating', 'name'

    db = SessionLocal()
    try:
        # Default to Bengaluru center if no user coordinates provided
        if lat is None or lon is None:
            lat = 12.8988
            lon = 77.5186

        # Log this search event for analytics
        now = datetime.utcnow()
        if query or category:
            search_log = SearchLog(
                user_id=g.user_id if hasattr(g, 'user_id') and g.user_id else None,
                query=query if query else None,
                category=category if category else None,
                latitude=lat,
                longitude=lon,
                timestamp=now,
                hour_of_day=now.hour,
                day_of_week=now.weekday()
            )
            db.add(search_log)
            db.commit()

        # Query approved and non-suspended businesses
        q = db.query(Business).filter(
            Business.is_approved == True,
            Business.is_suspended == False
        )

        if category and category.lower() != 'all':
            q = q.filter(Business.category.ilike(f"%{category}%"))

        if query:
            search_pattern = f"%{query}%"
            q = q.filter(
                (Business.name.ilike(search_pattern)) |
                (Business.description.ilike(search_pattern)) |
                (Business.tags.ilike(search_pattern)) |
                (Business.address.ilike(search_pattern))
            )

        businesses = q.all()

        results = []
        for b in businesses:
            dist = haversine_distance(lat, lon, b.latitude, b.longitude)
            if radius_km and dist > radius_km:
                continue

            b_data = b.to_dict()
            b_data["distance_km"] = dist
            # Add active offers summary
            valid_offers = [o.to_dict() for o in b.offers if o.is_currently_valid()]
            b_data["active_offers"] = valid_offers
            b_data["active_offers_count"] = len(valid_offers)
            results.append(b_data)

        # Sort results
        if sort_by == 'rating':
            results.sort(key=lambda x: x.get('average_rating', 0), reverse=True)
        elif sort_by == 'name':
            results.sort(key=lambda x: x.get('name', '').lower())
        else: # default: distance
            results.sort(key=lambda x: x.get('distance_km', 999))

        return jsonify({
            "count": len(results),
            "user_coords": {"latitude": lat, "longitude": lon},
            "businesses": results
        }), 200
    finally:
        db.close()

@businesses_bp.route('/<int:business_id>', methods=['GET'])
@optional_token
def get_business_detail(business_id):
    """
    Get detailed business info, active offers, events, and reviews.
    Logs the view event for analytics.
    """
    db = SessionLocal()
    try:
        business = db.query(Business).filter(Business.id == business_id).first()
        if not business:
            return jsonify({"error": "Business not found"}), 404

        if business.is_suspended:
            return jsonify({"error": "This business listing is temporarily suspended"}), 403

        # Log view event
        now = datetime.utcnow()
        view_log = ViewLog(
            business_id=business.id,
            user_id=g.user_id if hasattr(g, 'user_id') and g.user_id else None,
            timestamp=now,
            hour_of_day=now.hour,
            day_of_week=now.weekday()
        )
        db.add(view_log)
        db.commit()

        # Offers & events
        offers = [o.to_dict() for o in business.offers if not o.is_event and o.is_currently_valid()]
        events = [o.to_dict() for o in business.offers if o.is_event and o.is_currently_valid()]

        # Reviews
        reviews_q = [r for r in business.reviews if not r.is_hidden]
        reviews_q.sort(key=lambda x: x.created_at, reverse=True)
        reviews_data = [r.to_dict() for r in reviews_q]

        # Calculate sentiment percentage
        total_revs = len(reviews_data)
        pos_revs = sum(1 for r in reviews_data if r.get('sentiment') == 'positive')
        pos_pct = round(pos_revs / total_revs * 100, 1) if total_revs > 0 else 0.0

        data = business.to_dict()
        data["offers"] = offers
        data["events"] = events
        data["reviews"] = reviews_data
        data["positive_sentiment_pct"] = pos_pct
        data["positive_reviews_count"] = pos_revs
        data["negative_reviews_count"] = total_revs - pos_revs

        return jsonify({"business": data}), 200
    finally:
        db.close()

@businesses_bp.route('/my', methods=['GET'])
@role_required(['business_owner', 'admin'])
def get_my_business():
    """Returns the business associated with the authenticated business owner."""
    db = SessionLocal()
    try:
        business = db.query(Business).filter(Business.owner_id == g.user_id).first()
        if not business:
            return jsonify({"business": None, "message": "No business registered yet for this account"}), 200

        data = business.to_dict()
        data["offers_count"] = len(business.offers)
        data["reviews_count"] = len(business.reviews)
        return jsonify({"business": data}), 200
    finally:
        db.close()

@businesses_bp.route('', methods=['POST'])
@role_required(['business_owner', 'admin'])
def create_business():
    """Allows a business owner to create their business profile."""
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    category = (data.get('category') or '').strip()
    address = (data.get('address') or '').strip()
    city = (data.get('city') or 'Bengaluru').strip()
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if not name:
        return jsonify({"error": "Business name is required"}), 400
    if not category:
        return jsonify({"error": "Category is required"}), 400
    if not address:
        return jsonify({"error": "Address is required"}), 400
    if latitude is None or longitude is None:
        return jsonify({"error": "Latitude and longitude map coordinates are required"}), 400

    db = SessionLocal()
    try:
        # Check if owner already has a business (one primary business per owner)
        existing = db.query(Business).filter(Business.owner_id == g.user_id).first()
        if existing and g.user_role != 'admin':
            return jsonify({"error": "You already have a registered business profile. You can update it instead."}), 400

        new_business = Business(
            owner_id=g.user_id,
            name=name,
            category=category,
            description=data.get('description', ''),
            address=address,
            city=city,
            latitude=float(latitude),
            longitude=float(longitude),
            phone=data.get('phone', ''),
            email=data.get('email', ''),
            website=data.get('website', ''),
            opening_hours=data.get('opening_hours', 'Mon-Sat: 9:00 AM - 9:00 PM'),
            image_url=data.get('image_url', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'),
            tags=data.get('tags', ''),
            is_approved=True,
            is_suspended=False
        )
        db.add(new_business)
        db.commit()
        db.refresh(new_business)

        return jsonify({
            "message": "Business profile created successfully",
            "business": new_business.to_dict()
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": f"Failed to create business: {str(e)}"}), 500
    finally:
        db.close()

@businesses_bp.route('/<int:business_id>', methods=['PUT'])
@role_required(['business_owner', 'admin'])
def update_business(business_id):
    """Allows owner or admin to update business profile."""
    data = request.get_json() or {}

    db = SessionLocal()
    try:
        business = db.query(Business).filter(Business.id == business_id).first()
        if not business:
            return jsonify({"error": "Business not found"}), 404

        if business.owner_id != g.user_id and g.user_role != 'admin':
            return jsonify({"error": "Unauthorized to update this business"}), 403

        if 'name' in data and data['name']:
            business.name = data['name'].strip()
        if 'category' in data and data['category']:
            business.category = data['category'].strip()
        if 'description' in data:
            business.description = data['description']
        if 'address' in data and data['address']:
            business.address = data['address'].strip()
        if 'city' in data:
            business.city = data['city'].strip()
        if 'latitude' in data and data['latitude'] is not None:
            business.latitude = float(data['latitude'])
        if 'longitude' in data and data['longitude'] is not None:
            business.longitude = float(data['longitude'])
        if 'phone' in data:
            business.phone = data['phone']
        if 'email' in data:
            business.email = data['email']
        if 'website' in data:
            business.website = data['website']
        if 'opening_hours' in data:
            business.opening_hours = data['opening_hours']
        if 'image_url' in data and data['image_url']:
            business.image_url = data['image_url']
        if 'tags' in data:
            business.tags = data['tags']

        business.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(business)

        return jsonify({
            "message": "Business profile updated successfully",
            "business": business.to_dict()
        }), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": f"Failed to update business: {str(e)}"}), 500
    finally:
        db.close()

@businesses_bp.route('/<int:business_id>', methods=['DELETE'])
@role_required(['business_owner', 'admin'])
def delete_business(business_id):
    """Delete a business listing."""
    db = SessionLocal()
    try:
        business = db.query(Business).filter(Business.id == business_id).first()
        if not business:
            return jsonify({"error": "Business not found"}), 404

        if business.owner_id != g.user_id and g.user_role != 'admin':
            return jsonify({"error": "Unauthorized to delete this business"}), 403

        db.delete(business)
        db.commit()
        return jsonify({"message": "Business listing deleted successfully"}), 200
    finally:
        db.close()
