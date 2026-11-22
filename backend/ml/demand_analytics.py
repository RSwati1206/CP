from datetime import datetime, timedelta
from collections import defaultdict
from sqlalchemy import func
from backend.models import Business, Review, ViewLog, SearchLog, Offer
from backend.ml.recommender import haversine_distance

class DemandAnalyticsService:
    def __init__(self, db_session):
        self.db = db_session

    def get_owner_kpis(self, business_id):
        """Calculates core KPI numbers for an owner business."""
        business = self.db.query(Business).get(business_id)
        if not business:
            return None

        total_views = self.db.query(ViewLog).filter(ViewLog.business_id == business_id).count()
        # Search appearances: count search logs matching business category or name
        search_appearances = self.db.query(SearchLog).filter(
            (SearchLog.category == business.category) | 
            (SearchLog.query.ilike(f"%{business.name[:4]}%"))
        ).count()

        reviews = self.db.query(Review).filter(
            Review.business_id == business_id,
            Review.is_hidden == False
        ).all()

        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else 0.0
        active_offers_count = sum(1 for o in business.offers if o.is_currently_valid())

        return {
            "total_views": total_views,
            "search_appearances": search_appearances,
            "average_rating": avg_rating,
            "total_reviews": len(reviews),
            "active_offers_count": active_offers_count
        }

    def get_views_and_searches_trend(self, business_id, days=14):
        """Returns daily trend of views and search appearances over past days."""
        business = self.db.query(Business).get(business_id)
        if not business:
            return {"dates": [], "views": [], "searches": []}

        today = datetime.utcnow().date()
        date_list = [(today - timedelta(days=i)) for i in range(days - 1, -1, -1)]
        date_labels = [d.strftime("%b %d") for d in date_list]

        # Aggregate views by date
        views_by_date = defaultdict(int)
        views = self.db.query(ViewLog).filter(
            ViewLog.business_id == business_id,
            ViewLog.timestamp >= datetime.combine(date_list[0], datetime.min.time())
        ).all()
        for v in views:
            views_by_date[v.timestamp.date()] += 1

        # Aggregate search appearances by date
        searches_by_date = defaultdict(int)
        searches = self.db.query(SearchLog).filter(
            (SearchLog.category == business.category) | (SearchLog.query.ilike(f"%{business.name[:4]}%")),
            SearchLog.timestamp >= datetime.combine(date_list[0], datetime.min.time())
        ).all()
        for s in searches:
            searches_by_date[s.timestamp.date()] += 1

        views_series = [views_by_date[d] for d in date_list]
        searches_series = [searches_by_date[d] for d in date_list]

        return {
            "labels": date_labels,
            "views": views_series,
            "searches": searches_series
        }

    def get_sentiment_analytics(self, business_id):
        """Calculates positive vs negative review counts, ratio, and trend over time."""
        reviews = self.db.query(Review).filter(
            Review.business_id == business_id,
            Review.is_hidden == False
        ).order_by(Review.created_at.asc()).all()

        total = len(reviews)
        positive_count = sum(1 for r in reviews if r.sentiment == 'positive')
        negative_count = total - positive_count
        pos_percentage = round((positive_count / total * 100), 1) if total > 0 else 0.0
        neg_percentage = round((negative_count / total * 100), 1) if total > 0 else 0.0

        # Sentiment trend by month or recent chunks
        # Group reviews in 4 chronological periods
        trend_labels = []
        positive_trend = []
        negative_trend = []

        if total > 0:
            step = max(1, total // 4)
            for i in range(0, total, step):
                chunk = reviews[i:i+step]
                date_label = chunk[-1].created_at.strftime("%b %d")
                pos_c = sum(1 for r in chunk if r.sentiment == 'positive')
                neg_c = len(chunk) - pos_c
                trend_labels.append(date_label)
                positive_trend.append(pos_c)
                negative_trend.append(neg_c)

        return {
            "total_reviews": total,
            "positive_count": positive_count,
            "negative_count": negative_count,
            "positive_percentage": pos_percentage,
            "negative_percentage": neg_percentage,
            "trend": {
                "labels": trend_labels or ["Week 1", "Week 2", "Week 3", "Current"],
                "positive": positive_trend or [positive_count],
                "negative": negative_trend or [negative_count]
            }
        }

    def get_ratings_breakdown(self, business_id):
        """Calculates 1 to 5 star rating counts."""
        reviews = self.db.query(Review).filter(
            Review.business_id == business_id,
            Review.is_hidden == False
        ).all()

        star_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for r in reviews:
            if 1 <= r.rating <= 5:
                star_counts[r.rating] += 1

        return {
            "stars": [1, 2, 3, 4, 5],
            "counts": [star_counts[i] for i in range(1, 6)]
        }

    def get_demand_insights(self, business_id):
        """
        Analyzes time of day and day of week demand patterns.
        Time windows:
        - Morning (06:00 - 11:59)
        - Afternoon (12:00 - 16:59)
        - Evening (17:00 - 21:59)
        - Night (22:00 - 05:59)
        """
        business = self.db.query(Business).get(business_id)
        if not business:
            return {}

        views = self.db.query(ViewLog).filter(ViewLog.business_id == business_id).all()

        # Time of day aggregation
        time_windows = {
            "Morning (6am-12pm)": 0,
            "Afternoon (12pm-5pm)": 0,
            "Evening (5pm-10pm)": 0,
            "Night (10pm-6am)": 0
        }

        for v in views:
            h = v.hour_of_day
            if 6 <= h < 12:
                time_windows["Morning (6am-12pm)"] += 1
            elif 12 <= h < 17:
                time_windows["Afternoon (12pm-5pm)"] += 1
            elif 17 <= h < 22:
                time_windows["Evening (5pm-10pm)"] += 1
            else:
                time_windows["Night (10pm-6am)"] += 1

        # Day of week aggregation (0=Mon, 6=Sun)
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        day_counts = [0] * 7
        for v in views:
            d = v.day_of_week % 7
            day_counts[d] += 1

        # Peak window identification
        peak_time = max(time_windows.items(), key=lambda x: x[1])[0] if views else "Evening (5pm-10pm)"
        peak_day = day_names[day_counts.index(max(day_counts))] if views else "Saturday"

        # Popular categories in area from search logs
        top_category_queries = self.db.query(
            SearchLog.category, func.count(SearchLog.id)
        ).filter(SearchLog.category != None).group_by(SearchLog.category).order_by(func.count(SearchLog.id).desc()).limit(5).all()

        top_categories = [{"category": row[0], "searches": row[1]} for row in top_category_queries]

        return {
            "time_of_day": {
                "labels": list(time_windows.keys()),
                "data": list(time_windows.values())
            },
            "day_of_week": {
                "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                "data": day_counts
            },
            "peak_time_window": peak_time,
            "peak_day": peak_day,
            "top_searched_categories": top_categories
        }

    def get_competitor_comparison(self, business_id, radius_km=15.0):
        """
        Compares owner's business against other businesses in the same category nearby.
        Metrics: Average rating, review count, positive sentiment %, active offer count, view volume.
        """
        target = self.db.query(Business).get(business_id)
        if not target:
            return {}

        all_same_cat = self.db.query(Business).filter(
            Business.category == target.category,
            Business.is_approved == True,
            Business.is_suspended == False
        ).all()

        competitors = []
        for b in all_same_cat:
            dist = haversine_distance(target.latitude, target.longitude, b.latitude, b.longitude)
            if dist <= radius_km:
                revs = [r for r in b.reviews if not r.is_hidden]
                avg_r = round(sum(r.rating for r in revs) / len(revs), 1) if revs else 0.0
                pos_c = sum(1 for r in revs if r.sentiment == 'positive')
                pos_pct = round(pos_c / len(revs) * 100, 1) if revs else 0.0
                active_offers = sum(1 for o in b.offers if o.is_currently_valid())
                views_cnt = len(b.view_logs)

                competitors.append({
                    "id": b.id,
                    "name": b.name,
                    "is_current": (b.id == target.id),
                    "distance_km": dist,
                    "rating": avg_r,
                    "review_count": len(revs),
                    "positive_sentiment_pct": pos_pct,
                    "active_offers": active_offers,
                    "views": views_cnt
                })

        # Calculate category averages (excluding current business if competitors exist)
        rivals = [c for c in competitors if not c["is_current"]]
        current = next((c for c in competitors if c["is_current"]), None)

        if rivals:
            avg_rating = round(sum(c["rating"] for c in rivals) / len(rivals), 1)
            avg_reviews = round(sum(c["review_count"] for c in rivals) / len(rivals), 0)
            avg_sentiment = round(sum(c["positive_sentiment_pct"] for c in rivals) / len(rivals), 1)
            avg_offers = round(sum(c["active_offers"] for c in rivals) / len(rivals), 1)
            avg_views = round(sum(c["views"] for c in rivals) / len(rivals), 0)
        else:
            avg_rating = current["rating"] if current else 4.0
            avg_reviews = current["review_count"] if current else 10
            avg_sentiment = current["positive_sentiment_pct"] if current else 80.0
            avg_offers = current["active_offers"] if current else 1
            avg_views = current["views"] if current else 50

        # Radar chart benchmarks
        radar_metrics = {
            "labels": ["Rating (x20)", "Review Count", "Positive Sentiment %", "Active Offers (x20)", "Views"],
            "your_business": [
                (current["rating"] * 20) if current else 80,
                current["review_count"] if current else 10,
                current["positive_sentiment_pct"] if current else 80,
                (current["active_offers"] * 20) if current else 20,
                current["views"] if current else 50
            ],
            "category_average": [
                (avg_rating * 20),
                avg_reviews,
                avg_sentiment,
                (avg_offers * 20),
                avg_views
            ]
        }

        return {
            "category": target.category,
            "competitor_list": sorted(competitors, key=lambda x: x["distance_km"]),
            "radar_chart": radar_metrics,
            "category_averages": {
                "avg_rating": avg_rating,
                "avg_reviews": avg_reviews,
                "avg_sentiment": avg_sentiment,
                "avg_offers": avg_offers
            }
        }
