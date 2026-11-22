from flask import Blueprint, request, jsonify, g
from backend.database import SessionLocal
from backend.models import Business, Review, Offer
from backend.auth.utils import role_required
from backend.ml.demand_analytics import DemandAnalyticsService

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/owner/<int:business_id>', methods=['GET'])
@role_required(['business_owner', 'admin'])
def get_owner_analytics(business_id):
    """
    Comprehensive analytics dashboard endpoint for a business owner:
    - Overall KPIs
    - Views & Searches daily trends (Chart.js Line)
    - Star Ratings breakdown (Chart.js Bar)
    - Review Sentiment analysis & trend (Chart.js Doughnut & Line)
    - Time-of-day & Day-of-week demand patterns (Chart.js Bar)
    - Competitor Comparison benchmarks (Chart.js Radar & Table)
    - Offer performance metrics
    """
    db = SessionLocal()
    try:
        business = db.query(Business).filter(Business.id == business_id).first()
        if not business:
            return jsonify({"error": "Business not found"}), 404

        if business.owner_id != g.user_id and g.user_role != 'admin':
            return jsonify({"error": "Unauthorized to access analytics for this business"}), 403

        service = DemandAnalyticsService(db)

        kpis = service.get_owner_kpis(business_id)
        views_searches_trend = service.get_views_and_searches_trend(business_id, days=14)
        ratings_breakdown = service.get_ratings_breakdown(business_id)
        sentiment_analytics = service.get_sentiment_analytics(business_id)
        demand_insights = service.get_demand_insights(business_id)
        competitor_comparison = service.get_competitor_comparison(business_id, radius_km=15.0)

        # Offer performance
        offers_data = []
        for o in business.offers:
            offers_data.append({
                "id": o.id,
                "title": o.title,
                "is_event": o.is_event,
                "discount_percent": o.discount_percent,
                "discount_code": o.discount_code,
                "clicks_count": o.clicks_count,
                "is_active": o.is_active,
                "is_valid": o.is_currently_valid(),
                "start_date": o.start_date.strftime("%Y-%m-%d"),
                "end_date": o.end_date.strftime("%Y-%m-%d")
            })

        return jsonify({
            "business": {
                "id": business.id,
                "name": business.name,
                "category": business.category,
                "city": business.city
            },
            "kpis": kpis,
            "views_searches_trend": views_searches_trend,
            "ratings_breakdown": ratings_breakdown,
            "sentiment_analytics": sentiment_analytics,
            "demand_insights": demand_insights,
            "competitor_comparison": competitor_comparison,
            "offers_performance": offers_data
        }), 200
    finally:
        db.close()
