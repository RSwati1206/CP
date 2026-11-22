from flask import Blueprint, request, jsonify, g
from backend.database import SessionLocal
from backend.auth.utils import optional_token
from backend.ml.recommender import RecommenderEngine

recommendations_bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

@recommendations_bp.route('', methods=['GET'])
@optional_token
def get_recommendations():
    """
    Returns personalized shop and offer recommendations for the current customer.
    If no user is logged in, provides location-based recommendations centered at default coords.
    """
    lat = request.args.get('latitude', default=12.8988, type=float)
    lon = request.args.get('longitude', default=77.5186, type=float)
    limit = request.args.get('limit', default=6, type=int)

    db = SessionLocal()
    try:
        user_id = g.user_id if hasattr(g, 'user_id') and g.user_id else None
        engine = RecommenderEngine(db)

        recommended_shops = engine.recommend_businesses(
            user_id=user_id,
            user_lat=lat,
            user_lon=lon,
            limit=limit
        )

        recommended_offers = engine.recommend_offers(
            user_id=user_id,
            limit=4
        )

        user_preferences = engine.get_user_preferences(user_id) if user_id else {}

        return jsonify({
            "user_id": user_id,
            "has_personalized_history": bool(user_preferences),
            "top_categories_affinity": sorted(user_preferences.items(), key=lambda x: x[1], reverse=True)[:3],
            "recommended_shops": recommended_shops,
            "recommended_offers": recommended_offers
        }), 200
    finally:
        db.close()
