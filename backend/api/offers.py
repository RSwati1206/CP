from datetime import datetime
from flask import Blueprint, request, jsonify, g
from backend.database import SessionLocal
from backend.models import Offer, Business, OfferClick
from backend.auth.utils import token_required, role_required, optional_token

offers_bp = Blueprint('offers', __name__, url_prefix='/api/offers')

@offers_bp.route('', methods=['GET'])
def list_offers():
    """Returns all active offers and events across all businesses."""
    is_event = request.args.get('is_event')
    business_id = request.args.get('business_id', type=int)

    db = SessionLocal()
    try:
        q = db.query(Offer).join(Business).filter(
            Business.is_approved == True,
            Business.is_suspended == False,
            Offer.is_active == True
        )

        if is_event is not None:
            val = is_event.lower() in ['true', '1', 'yes']
            q = q.filter(Offer.is_event == val)

        if business_id:
            q = q.filter(Offer.business_id == business_id)

        all_offers = q.all()
        # Return only currently valid offers/events
        valid = [o.to_dict() for o in all_offers if o.is_currently_valid()]
        return jsonify({"count": len(valid), "offers": valid}), 200
    finally:
        db.close()

@offers_bp.route('/<int:offer_id>/click', methods=['POST'])
@optional_token
def log_offer_click(offer_id):
    """Logs an offer click and increments count."""
    db = SessionLocal()
    try:
        offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not offer:
            return jsonify({"error": "Offer not found"}), 404

        offer.clicks_count += 1
        click = OfferClick(
            offer_id=offer.id,
            user_id=g.user_id if hasattr(g, 'user_id') and g.user_id else None,
            timestamp=datetime.utcnow()
        )
        db.add(click)
        db.commit()
        return jsonify({"message": "Click recorded", "clicks_count": offer.clicks_count}), 200
    finally:
        db.close()

@offers_bp.route('', methods=['POST'])
@role_required(['business_owner', 'admin'])
def create_offer():
    """Allows business owners to create an offer or event."""
    data = request.get_json() or {}
    business_id = data.get('business_id')
    title = (data.get('title') or '').strip()
    description = (data.get('description') or '').strip()
    discount_code = (data.get('discount_code') or '').strip()
    discount_percent = data.get('discount_percent')
    start_date_str = data.get('start_date')
    end_date_str = data.get('end_date')
    is_event = bool(data.get('is_event', False))
    banner_url = data.get('banner_url')

    if not title:
        return jsonify({"error": "Title is required"}), 400
    if not start_date_str or not end_date_str:
        return jsonify({"error": "Start date and end date are required"}), 400

    try:
        start_date = datetime.fromisoformat(start_date_str.replace('Z', ''))
        end_date = datetime.fromisoformat(end_date_str.replace('Z', ''))
    except Exception:
        return jsonify({"error": "Invalid date format. Use ISO format YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS"}), 400

    if end_date < start_date:
        return jsonify({"error": "End date cannot be earlier than start date"}), 400

    db = SessionLocal()
    try:
        # If business_id not specified, find owner's primary business
        if not business_id:
            user_business = db.query(Business).filter(Business.owner_id == g.user_id).first()
            if not user_business:
                return jsonify({"error": "No business found for your owner account. Create a business first."}), 400
            business_id = user_business.id
        else:
            b = db.query(Business).filter(Business.id == business_id).first()
            if not b:
                return jsonify({"error": "Business not found"}), 404
            if b.owner_id != g.user_id and g.user_role != 'admin':
                return jsonify({"error": "Unauthorized to add offers for this business"}), 403

        offer = Offer(
            business_id=business_id,
            title=title,
            description=description,
            discount_code=discount_code if discount_code else None,
            discount_percent=float(discount_percent) if discount_percent else None,
            start_date=start_date,
            end_date=end_date,
            is_event=is_event,
            banner_url=banner_url,
            is_active=True
        )
        db.add(offer)
        db.commit()
        db.refresh(offer)

        return jsonify({"message": "Promotion created successfully", "offer": offer.to_dict()}), 201
    finally:
        db.close()

@offers_bp.route('/<int:offer_id>', methods=['PUT'])
@role_required(['business_owner', 'admin'])
def update_offer(offer_id):
    """Update or toggle offer/event."""
    data = request.get_json() or {}

    db = SessionLocal()
    try:
        offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not offer:
            return jsonify({"error": "Offer not found"}), 404

        if offer.business.owner_id != g.user_id and g.user_role != 'admin':
            return jsonify({"error": "Unauthorized"}), 403

        if 'title' in data and data['title']:
            offer.title = data['title'].strip()
        if 'description' in data:
            offer.description = data['description']
        if 'discount_code' in data:
            offer.discount_code = data['discount_code']
        if 'discount_percent' in data and data['discount_percent'] is not None:
            offer.discount_percent = float(data['discount_percent'])
        if 'start_date' in data and data['start_date']:
            offer.start_date = datetime.fromisoformat(data['start_date'].replace('Z', ''))
        if 'end_date' in data and data['end_date']:
            offer.end_date = datetime.fromisoformat(data['end_date'].replace('Z', ''))
        if 'is_event' in data:
            offer.is_event = bool(data['is_event'])
        if 'banner_url' in data:
            offer.banner_url = data['banner_url']
        if 'is_active' in data:
            offer.is_active = bool(data['is_active'])

        db.commit()
        db.refresh(offer)
        return jsonify({"message": "Offer updated successfully", "offer": offer.to_dict()}), 200
    finally:
        db.close()

@offers_bp.route('/<int:offer_id>', methods=['DELETE'])
@role_required(['business_owner', 'admin'])
def delete_offer(offer_id):
    """Delete an offer or event."""
    db = SessionLocal()
    try:
        offer = db.query(Offer).filter(Offer.id == offer_id).first()
        if not offer:
            return jsonify({"error": "Offer not found"}), 404

        if offer.business.owner_id != g.user_id and g.user_role != 'admin':
            return jsonify({"error": "Unauthorized"}), 403

        db.delete(offer)
        db.commit()
        return jsonify({"message": "Offer deleted successfully"}), 200
    finally:
        db.close()
