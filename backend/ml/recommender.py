import math
from collections import defaultdict
from backend.models import Business, Review, ViewLog, SearchLog, Offer

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance in kilometers between two lat/lon coordinates."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class RecommenderEngine:
    def __init__(self, db_session):
        self.db = db_session

    def get_user_preferences(self, user_id):
        """
        Builds a customer preference profile by weighting:
        - Categories of businesses they viewed (+1 per view)
        - Categories they searched for (+2 per search)
        - Categories where they gave high ratings (+3 if rating >= 4, -2 if rating <= 2)
        """
        category_weights = defaultdict(float)

        if not user_id:
            return category_weights

        # 1. View history
        views = self.db.query(ViewLog).filter(ViewLog.user_id == user_id).all()
        for v in views:
            if v.business and v.business.category:
                category_weights[v.business.category] += 1.0

        # 2. Search history
        searches = self.db.query(SearchLog).filter(SearchLog.user_id == user_id).all()
        for s in searches:
            if s.category:
                category_weights[s.category] += 2.0
            if s.query:
                # Partial match search query against known categories
                for cat in ["Restaurants & Cafes", "Grocery & Supermarket", "Salons & Spas", 
                            "Retail & Fashion", "Healthcare & Pharmacy", "Fitness & Gym", 
                            "Electronics & Repair", "Bakery & Sweets"]:
                    if s.query.lower() in cat.lower():
                        category_weights[cat] += 1.5

        # 3. Reviews and ratings
        reviews = self.db.query(Review).filter(Review.user_id == user_id).all()
        for r in reviews:
            if r.business and r.business.category:
                if r.rating >= 4:
                    category_weights[r.business.category] += 3.0
                elif r.rating <= 2:
                    category_weights[r.business.category] -= 2.0

        return category_weights

    def recommend_businesses(self, user_id=None, user_lat=12.8988, user_lon=77.5186, limit=6):
        """
        Scores candidate businesses based on:
        - User category affinity score (40%)
        - Distance proximity score (30%)
        - Rating & popularity score (20%)
        - Active offers bonus (10%)
        """
        businesses = self.db.query(Business).filter(
            Business.is_approved == True,
            Business.is_suspended == False
        ).all()

        user_prefs = self.get_user_preferences(user_id) if user_id else {}
        top_pref_cat = max(user_prefs.items(), key=lambda x: x[1])[0] if user_prefs else None

        scored_list = []
        for b in businesses:
            # 1. Distance
            dist_km = haversine_distance(user_lat, user_lon, b.latitude, b.longitude)
            # Normalize distance: 0km => 1.0, 15km+ => 0.1
            distance_score = max(0.1, 1.0 - (dist_km / 15.0))

            # 2. Category affinity
            cat_weight = user_prefs.get(b.category, 0.0)
            affinity_score = min(1.0, max(0.0, cat_weight / 5.0)) if cat_weight > 0 else 0.2

            # 3. Ratings & reviews
            avg_rating = 0.0
            if b.reviews:
                avg_rating = sum(r.rating for r in b.reviews) / len(b.reviews)
            rating_score = (avg_rating / 5.0) if avg_rating > 0 else 0.5

            # 4. Active offers bonus
            has_active_offer = any(o.is_currently_valid() for o in b.offers)
            offer_bonus = 0.2 if has_active_offer else 0.0

            # Composite weighted score
            total_score = (affinity_score * 0.40) + (distance_score * 0.30) + (rating_score * 0.20) + offer_bonus

            # Determine human-readable recommendation explanation
            if top_pref_cat and b.category == top_pref_cat:
                reason = f"Matches your interest in {b.category}"
            elif has_active_offer and dist_km < 3.0:
                reason = f"Special deal available just {dist_km} km away"
            elif avg_rating >= 4.5:
                reason = f"Highly rated local favorite ({avg_rating}★)"
            elif dist_km < 2.0:
                reason = f"Very close to your current location ({dist_km} km)"
            else:
                reason = "Popular choice in Bengaluru"

            item = b.to_dict()
            item["distance_km"] = dist_km
            item["recommendation_score"] = round(total_score, 3)
            item["recommendation_reason"] = reason
            item["has_active_offer"] = has_active_offer
            scored_list.append(item)

        # Sort descending by score
        scored_list.sort(key=lambda x: x["recommendation_score"], reverse=True)
        return scored_list[:limit]

    def recommend_offers(self, user_id=None, limit=4):
        """
        Recommends best active deals/events prioritized by user preference and validity.
        """
        offers = self.db.query(Offer).filter(Offer.is_active == True).all()
        user_prefs = self.get_user_preferences(user_id) if user_id else {}

        valid_offers = [o for o in offers if o.is_currently_valid() and o.business and not o.business.is_suspended]

        scored_offers = []
        for o in valid_offers:
            cat = o.business.category if o.business else ""
            cat_pref = user_prefs.get(cat, 0.0)
            score = 1.0 + cat_pref + (o.discount_percent or 10.0) * 0.05
            
            reason = f"Trending deal in {cat}" if cat_pref > 0 else "Featured promotion"
            data = o.to_dict()
            data["recommendation_score"] = score
            data["recommendation_reason"] = reason
            scored_offers.append(data)

        scored_offers.sort(key=lambda x: x["recommendation_score"], reverse=True)
        return scored_offers[:limit]
