from flask import Blueprint, request, jsonify
from backend.database import SessionLocal
from backend.models import User, Business, Offer, Review, SearchLog, ViewLog
from backend.auth.utils import role_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/metrics', methods=['GET'])
@role_required(['admin'])
def get_admin_metrics():
    """Returns platform-wide metrics for administrator dashboard."""
    db = SessionLocal()
    try:
        total_users = db.query(User).count()
        customers_count = db.query(User).filter(User.role == 'customer').count()
        owners_count = db.query(User).filter(User.role == 'business_owner').count()
        total_businesses = db.query(Business).count()
        active_businesses = db.query(Business).filter(Business.is_approved == True, Business.is_suspended == False).count()
        total_offers = db.query(Offer).count()
        total_reviews = db.query(Review).count()
        total_searches = db.query(SearchLog).count()
        total_views = db.query(ViewLog).count()

        return jsonify({
            "total_users": total_users,
            "customers_count": customers_count,
            "owners_count": owners_count,
            "total_businesses": total_businesses,
            "active_businesses": active_businesses,
            "total_offers": total_offers,
            "total_reviews": total_reviews,
            "total_searches": total_searches,
            "total_views": total_views
        }), 200
    finally:
        db.close()

@admin_bp.route('/users', methods=['GET'])
@role_required(['admin'])
def list_users():
    """Lists users with optional role filtering."""
    role = request.args.get('role')
    search = request.args.get('search', '').strip().lower()

    db = SessionLocal()
    try:
        q = db.query(User)
        if role:
            q = q.filter(User.role == role)
        if search:
            q = q.filter((User.name.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%")))

        users = q.order_by(User.created_at.desc()).all()
        return jsonify({"users": [u.to_dict() for u in users]}), 200
    finally:
        db.close()

@admin_bp.route('/users/<int:user_id>/status', methods=['PUT'])
@role_required(['admin'])
def toggle_user_status(user_id):
    """Toggle user active / suspended status."""
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        if user.role == 'admin':
            return jsonify({"error": "Cannot suspend an administrator account"}), 400

        if 'is_active' in data:
            user.is_active = bool(data['is_active'])
        else:
            user.is_active = not user.is_active

        db.commit()
        return jsonify({"message": f"User {'activated' if user.is_active else 'deactivated'} successfully", "user": user.to_dict()}), 200
    finally:
        db.close()

@admin_bp.route('/businesses', methods=['GET'])
@role_required(['admin'])
def list_businesses_admin():
    """Lists all businesses including unapproved and suspended ones."""
    db = SessionLocal()
    try:
        businesses = db.query(Business).order_by(Business.created_at.desc()).all()
        results = []
        for b in businesses:
            d = b.to_dict()
            d["owner_name"] = b.owner.name if b.owner else "Unknown"
            d["owner_email"] = b.owner.email if b.owner else "Unknown"
            results.append(d)
        return jsonify({"businesses": results}), 200
    finally:
        db.close()

@admin_bp.route('/businesses/<int:business_id>/status', methods=['PUT'])
@role_required(['admin'])
def update_business_status(business_id):
    """Admin endpoint to approve, reject, or suspend a business."""
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        business = db.query(Business).filter(Business.id == business_id).first()
        if not business:
            return jsonify({"error": "Business not found"}), 404

        if 'is_approved' in data:
            business.is_approved = bool(data['is_approved'])
        if 'is_suspended' in data:
            business.is_suspended = bool(data['is_suspended'])

        db.commit()
        return jsonify({
            "message": "Business status updated successfully",
            "business": business.to_dict()
        }), 200
    finally:
        db.close()

@admin_bp.route('/reviews', methods=['GET'])
@role_required(['admin'])
def list_reviews_admin():
    """Lists all reviews with moderation details."""
    sentiment = request.args.get('sentiment')
    only_flagged = request.args.get('flagged')

    db = SessionLocal()
    try:
        q = db.query(Review)
        if sentiment:
            q = q.filter(Review.sentiment == sentiment)
        if only_flagged and only_flagged.lower() in ['true', '1']:
            q = q.filter(Review.is_flagged == True)

        reviews = q.order_by(Review.created_at.desc()).all()
        return jsonify({"reviews": [r.to_dict() for r in reviews]}), 200
    finally:
        db.close()

@admin_bp.route('/reviews/<int:review_id>/moderate', methods=['PUT'])
@role_required(['admin'])
def moderate_review(review_id):
    """Admin moderate review: toggle is_hidden or is_flagged."""
    data = request.get_json() or {}
    db = SessionLocal()
    try:
        review = db.query(Review).filter(Review.id == review_id).first()
        if not review:
            return jsonify({"error": "Review not found"}), 404

        if 'is_hidden' in data:
            review.is_hidden = bool(data['is_hidden'])
        if 'is_flagged' in data:
            review.is_flagged = bool(data['is_flagged'])

        db.commit()
        return jsonify({
            "message": "Review moderated successfully",
            "review": review.to_dict()
        }), 200
    finally:
        db.close()

@admin_bp.route('/reviews/<int:review_id>', methods=['DELETE'])
@role_required(['admin'])
def delete_review_admin(review_id):
    """Permanently delete a review."""
    db = SessionLocal()
    try:
        review = db.query(Review).filter(Review.id == review_id).first()
        if not review:
            return jsonify({"error": "Review not found"}), 404

        db.delete(review)
        db.commit()
        return jsonify({"message": "Review permanently deleted"}), 200
    finally:
        db.close()
