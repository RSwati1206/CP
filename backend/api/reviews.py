from datetime import datetime
from flask import Blueprint, request, jsonify, g
from backend.database import SessionLocal
from backend.models import Review, Business
from backend.auth.utils import token_required, role_required
from backend.ml.sentiment_analyzer import sentiment_analyzer

reviews_bp = Blueprint('reviews', __name__, url_prefix='/api/reviews')

@reviews_bp.route('', methods=['POST'])
@token_required
def create_review():
    """
    Submits a new review.
    Runs automated ML text classification to classify sentiment as positive or negative.
    """
    data = request.get_json() or {}
    business_id = data.get('business_id')
    rating = data.get('rating')
    title = (data.get('title') or '').strip()
    comment = (data.get('comment') or '').strip()

    if not business_id:
        return jsonify({"error": "business_id is required"}), 400

    if rating is None or not (1 <= int(rating) <= 5):
        return jsonify({"error": "Rating must be an integer between 1 and 5"}), 400

    if not comment or len(comment) < 5:
        return jsonify({"error": "Comment must be at least 5 characters long"}), 400

    db = SessionLocal()
    try:
        business = db.query(Business).filter(Business.id == business_id).first()
        if not business:
            return jsonify({"error": "Business not found"}), 404

        # Run automated sentiment analysis
        sentiment_res = sentiment_analyzer.analyze(comment)
        # If star rating is 1 or 2, force negative if not already; if 4 or 5 and text neutral, default positive
        rating_int = int(rating)
        classified_sentiment = sentiment_res["sentiment"]
        confidence = sentiment_res["confidence"]

        if rating_int <= 2:
            classified_sentiment = "negative"
            confidence = max(0.85, confidence)
        elif rating_int >= 4 and classified_sentiment == "negative" and "not" not in comment.lower():
            classified_sentiment = "positive"
            confidence = max(0.80, confidence)

        review = Review(
            business_id=business.id,
            user_id=g.user_id,
            rating=rating_int,
            title=title if title else None,
            comment=comment,
            sentiment=classified_sentiment,
            sentiment_score=confidence,
            is_flagged=False,
            is_hidden=False,
            created_at=datetime.utcnow()
        )
        db.add(review)
        db.commit()
        db.refresh(review)

        return jsonify({
            "message": "Review submitted successfully",
            "review": review.to_dict(),
            "sentiment_insights": {
                "sentiment": classified_sentiment,
                "confidence": confidence,
                "keywords": sentiment_res.get("keywords", [])
            }
        }), 201
    finally:
        db.close()

@reviews_bp.route('/business/<int:business_id>', methods=['GET'])
def get_business_reviews(business_id):
    """Returns reviews for a business along with positive-vs-negative sentiment summary."""
    db = SessionLocal()
    try:
        business = db.query(Business).filter(Business.id == business_id).first()
        if not business:
            return jsonify({"error": "Business not found"}), 404

        reviews = db.query(Review).filter(
            Review.business_id == business_id,
            Review.is_hidden == False
        ).order_by(Review.created_at.desc()).all()

        total = len(reviews)
        positive_count = sum(1 for r in reviews if r.sentiment == 'positive')
        negative_count = total - positive_count
        avg_rating = round(sum(r.rating for r in reviews) / total, 1) if total > 0 else 0.0

        return jsonify({
            "total_reviews": total,
            "average_rating": avg_rating,
            "positive_count": positive_count,
            "negative_count": negative_count,
            "positive_percentage": round(positive_count / total * 100, 1) if total > 0 else 0.0,
            "reviews": [r.to_dict() for r in reviews]
        }), 200
    finally:
        db.close()
