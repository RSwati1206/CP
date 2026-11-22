from backend.api.businesses import businesses_bp
from backend.api.offers import offers_bp
from backend.api.reviews import reviews_bp
from backend.api.recommendations import recommendations_bp
from backend.api.owner_analytics import analytics_bp
from backend.api.admin import admin_bp

__all__ = [
    'businesses_bp',
    'offers_bp',
    'reviews_bp',
    'recommendations_bp',
    'analytics_bp',
    'admin_bp'
]
