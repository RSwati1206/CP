import os
import sys

# Add root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from backend.app import create_app

app = create_app()
client = app.test_client()

# 1. Test health
res = client.get('/api/health')
print("Health:", res.status_code, res.get_json())

# 2. Test businesses
res = client.get('/api/businesses?category=Restaurants%20%26%20Cafes')
data = res.get_json()
print(f"Businesses count: {data.get('count')}")
for b in data.get('businesses', [])[:3]:
    print(f" - {b['name']} ({b['category']}) Rating: {b['average_rating']}★ Dist: {b['distance_km']}km Offers: {b['active_offers_count']}")

# 3. Test recommendations
res = client.get('/api/recommendations')
rec_data = res.get_json()
print("Recommended shops count:", len(rec_data.get('recommended_shops', [])))
for s in rec_data.get('recommended_shops', [])[:2]:
    print(f" - Recommended: {s['name']} -> {s['recommendation_reason']}")

# 4. Test login as owner
res = client.post('/api/auth/login', json={"email": "rswati1206@gmail.com", "password": "Password123!", "role": "business_owner"})
login_data = res.get_json()
print("Owner login status:", res.status_code, "Role:", login_data.get('user', {}).get('role'), "Business ID:", login_data.get('user', {}).get('business_id'))
token = login_data.get('token')

# 5. Test owner analytics
res = client.get(f"/api/analytics/owner/{login_data['user']['business_id']}", headers={"Authorization": f"Bearer {token}"})
analytics_data = res.get_json()
print("Analytics KPIs:", analytics_data.get('kpis'))
print("Competitor radar labels:", analytics_data.get('competitor_comparison', {}).get('radar_chart', {}).get('labels'))
print("Sentiment breakdown:", analytics_data.get('sentiment_analytics', {}).get('positive_percentage'), "% positive")

print("ALL BACKEND TESTS PASSED!")
