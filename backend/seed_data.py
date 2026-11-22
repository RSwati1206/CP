import os
import sys

# Ensure repository root is on Python sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import random
from datetime import datetime, timedelta
from backend.database import SessionLocal, init_db
from backend.models import User, Business, Offer, Review, SearchLog, ViewLog, OfferClick
from backend.ml.sentiment_analyzer import sentiment_analyzer

def seed_database():
    print("Initializing database schema...")
    init_db()
    db = SessionLocal()

    # If already seeded with demo accounts, skip re-seeding
    existing_admin = db.query(User).filter(User.email == 'admin@demo.com').first()
    if existing_admin:
        print("Database already contains seed data. Skipping seed.")
        db.close()
        return

    print("Seeding users (Admin, Owners, Customers)...")

    # 1. Primary Users
    admin_user = User(
        name="System Administrator",
        email="admin@demo.com",
        role="admin",
        phone="+91 98801 12345",
        address="RNSIT Campus, Channasandra, Bengaluru",
        is_active=True
    )
    admin_user.set_password("Password123!")
    db.add(admin_user)

    # Primary demo owner (R. Swati)
    demo_owner = User(
        name="R. Swati (Owner)",
        email="rswati1206@gmail.com",
        role="business_owner",
        phone="+91 98450 67890",
        address="12th Cross, Ideal Homes, RR Nagar, Bengaluru",
        is_active=True
    )
    demo_owner.set_password("Password123!")
    db.add(demo_owner)

    # Alias owner for owner@demo.com compatibility
    alias_owner = User(
        name="Vikram Rao",
        email="owner@demo.com",
        role="business_owner",
        phone="+91 98450 67890",
        address="12th Cross, Ideal Homes, RR Nagar, Bengaluru",
        is_active=True
    )
    alias_owner.set_password("Password123!")
    db.add(alias_owner)

    # Primary demo customer (R. Swati)
    demo_customer = User(
        name="R. Swati (Customer)",
        email="rswati1206@gmail.com",
        role="customer",
        phone="+91 99001 23456",
        address="BEML Layout, RR Nagar, Bengaluru",
        is_active=True
    )
    demo_customer.set_password("Password123!")
    db.add(demo_customer)

    # Alias customer for customer@demo.com compatibility
    alias_customer = User(
        name="Priya Sharma",
        email="customer@demo.com",
        role="customer",
        phone="+91 99001 23456",
        address="BEML Layout, RR Nagar, Bengaluru",
        is_active=True
    )
    alias_customer.set_password("Password123!")
    db.add(alias_customer)

    # Additional owners
    owner_accounts = [demo_owner]
    extra_owners_data = [
        ("Ananya Hegde", "ananya@organicmart.com", "+91 98451 11223", "Kengeri Satellite Town, Bengaluru"),
        ("Rahul Deshmukh", "rahul@glowspa.com", "+91 98452 22334", "Banashankari 3rd Stage, Bengaluru"),
        ("Sunita Patil", "sunita@freshfarm.com", "+91 98453 33445", "Jayanagar 4th Block, Bengaluru"),
        ("Mohammed Arif", "arif@techcare.com", "+91 98454 44556", "RR Nagar Central, Bengaluru"),
        ("Kavita Menon", "kavita@ironcore.com", "+91 98455 55667", "Channasandra, Bengaluru"),
        ("Siddharth Verma", "siddharth@brewbake.com", "+91 98456 66778", "Koramangala 5th Block, Bengaluru"),
        ("Deepak Shenoy", "deepak@udupi.com", "+91 98457 77889", "Uttarahalli Main Road, Bengaluru")
    ]

    for name, email, phone, addr in extra_owners_data:
        o = User(name=name, email=email, role="business_owner", phone=phone, address=addr, is_active=True)
        o.set_password("Password123!")
        db.add(o)
        owner_accounts.append(o)

    # Additional customers for realistic reviews
    customer_accounts = [demo_customer]
    extra_customers_data = [
        ("Arjun Nair", "arjun.nair@gmail.com"),
        ("Sneha Kulkarni", "sneha.k@gmail.com"),
        ("Rohan Gupta", "rohan.g@yahoo.com"),
        ("Meera Iyer", "meera.iyer@outlook.com"),
        ("Karthik Bhat", "karthik.bhat@gmail.com"),
        ("Pooja Reddy", "pooja.reddy@gmail.com"),
        ("Divya Patel", "divya.p@gmail.com")
    ]
    for name, email in extra_customers_data:
        c = User(name=name, email=email, role="customer", is_active=True)
        c.set_password("Password123!")
        db.add(c)
        customer_accounts.append(c)

    db.commit()

    print("Seeding 16 realistic Bengaluru local businesses...")
    # Base location: RNSIT / RR Nagar / South Bengaluru: 12.8988, 77.5186
    businesses_data = [
        # 1. Primary demo owner's business
        {
            "owner": demo_owner,
            "name": "The Bengaluru Bistro & Rooftop Cafe",
            "category": "Restaurants & Cafes",
            "description": "Chic multi-cuisine bistro and rooftop cafe serving artisanal pizzas, pastas, craft coffees, and authentic Karnataka fusion delicacies with a scenic skyline view.",
            "address": "45/2, 80 Feet Road, Ideal Homes Township, RR Nagar",
            "city": "Bengaluru",
            "lat": 12.9035,
            "lon": 77.5210,
            "phone": "+91 80 2860 1122",
            "email": "contact@bengalurubistro.in",
            "website": "https://bengalurubistro.in",
            "opening_hours": "Mon-Sun: 11:00 AM - 11:30 PM",
            "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
            "tags": "cafe, rooftop, italian, coffee, continental, live music"
        },
        # 2. Competitor Restaurant 1
        {
            "owner": owner_accounts[7],
            "name": "Udupi Grand Sagar",
            "category": "Restaurants & Cafes",
            "description": "Authentic vegetarian South Indian delicacies, legendary crispy masala dosas, idli vadas, and traditional filter coffee served fresh from 6:30 AM.",
            "address": "12, BEML Main Road, Rajarajeshwari Nagar",
            "city": "Bengaluru",
            "lat": 12.9080,
            "lon": 77.5250,
            "phone": "+91 80 2860 3344",
            "email": "manager@udupigrandsagar.com",
            "website": "https://udupigrandsagar.com",
            "opening_hours": "Mon-Sun: 6:30 AM - 10:30 PM",
            "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
            "tags": "south indian, vegetarian, dosa, breakfast, filter coffee"
        },
        # 3. Competitor Restaurant 2
        {
            "owner": owner_accounts[6],
            "name": "Brew & Bake Artisanal Bakery Cafe",
            "category": "Restaurants & Cafes",
            "description": "European-style specialty coffee house and artisan sourdough bakery. Handcrafted pastries, cold brews, and healthy brunch bowls.",
            "address": "104, 17th Cross, Kengeri Satellite Town",
            "city": "Bengaluru",
            "lat": 12.9150,
            "lon": 77.4850,
            "phone": "+91 80 2861 5566",
            "email": "hello@brewandbake.in",
            "website": "https://brewandbake.in",
            "opening_hours": "Tue-Sun: 8:00 AM - 10:00 PM",
            "image": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
            "tags": "bakery, cafe, coffee, breakfast, pastries, sourdough"
        },
        # 4. Competitor Restaurant 3
        {
            "owner": owner_accounts[0],
            "name": "Spice Symphony Coastal Diner",
            "category": "Restaurants & Cafes",
            "description": "Traditional Mangalorean and coastal seafood kitchen famous for Neer Dosa, Ghee Roast, and coastal curries prepared with home-ground spices.",
            "address": "88, Uttarahalli Main Road, Canara Bank Colony",
            "city": "Bengaluru",
            "lat": 12.8940,
            "lon": 77.5310,
            "phone": "+91 80 2860 7788",
            "email": "dine@spicesymphony.com",
            "website": "https://spicesymphony.com",
            "opening_hours": "Mon-Sun: 12:00 PM - 3:30 PM, 7:00 PM - 11:00 PM",
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
            "tags": "coastal, mangalorean, seafood, ghee roast, dinner"
        },
        # 5. Grocery 1
        {
            "owner": owner_accounts[1],
            "name": "Green Valley Organic Mart",
            "category": "Grocery & Supermarket",
            "description": "Farm-fresh organic fruits, hydroponic greens, cold-pressed oils, millets, and chemical-free pantry staples directly sourced from local Karnataka farmers.",
            "address": "22, Jawaharlal Nehru Road, BEML Layout 3rd Stage, RR Nagar",
            "city": "Bengaluru",
            "lat": 12.9015,
            "lon": 77.5175,
            "phone": "+91 98450 11999",
            "email": "care@greenvalleymart.com",
            "website": "https://greenvalleymart.com",
            "opening_hours": "Mon-Sun: 7:00 AM - 9:30 PM",
            "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
            "tags": "organic, grocery, vegetables, fruits, millets, cold pressed"
        },
        # 6. Grocery 2
        {
            "owner": owner_accounts[3],
            "name": "Sri Krishna Daily Provisions & Superstore",
            "category": "Grocery & Supermarket",
            "description": "Neighborhood one-stop supermarket with wide selection of grains, pulses, dairy, household essentials, and free 30-minute home delivery within 3km.",
            "address": "77, Channasandra Main Road, near RNSIT Gate",
            "city": "Bengaluru",
            "lat": 12.8965,
            "lon": 77.5140,
            "phone": "+91 80 2860 8899",
            "email": "orders@srikrishnastores.com",
            "website": "https://srikrishnastores.com",
            "opening_hours": "Mon-Sun: 7:30 AM - 10:00 PM",
            "image": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80",
            "tags": "supermarket, provisions, dairy, home delivery, discount"
        },
        # 7. Salon & Spa 1
        {
            "owner": owner_accounts[2],
            "name": "Glow & Grace Unisex Salon & Luxury Spa",
            "category": "Salons & Spas",
            "description": "Premium unisex salon offering creative hair styling, keratin treatments, bridal makeovers, soothing facials, and therapeutic body massages by certified stylists.",
            "address": "3rd Floor, SLN Arcade, 80ft Road, RR Nagar",
            "city": "Bengaluru",
            "lat": 12.9050,
            "lon": 77.5230,
            "phone": "+91 98450 44332",
            "email": "appointments@glowandgrace.com",
            "website": "https://glowandgrace.com",
            "opening_hours": "Tue-Sun: 9:30 AM - 8:30 PM",
            "image": "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
            "tags": "salon, spa, haircut, facial, bridal makeover, massage"
        },
        # 8. Salon & Spa 2
        {
            "owner": owner_accounts[2],
            "name": "Aura Ayurvedic Wellness Center",
            "category": "Salons & Spas",
            "description": "Authentic Kerala Ayurvedic therapy center offering Abhyangam, Shirodhara, herbal steam baths, and Panchakarma rejuvenation treatments by experienced Vaidyas.",
            "address": "15, 5th Cross, Rajarajeshwari Temple Road, RR Nagar",
            "city": "Bengaluru",
            "lat": 12.8990,
            "lon": 77.5270,
            "phone": "+91 80 2860 9900",
            "email": "contact@aurawellness.in",
            "website": "https://aurawellness.in",
            "opening_hours": "Mon-Sat: 8:00 AM - 7:30 PM",
            "image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
            "tags": "ayurveda, wellness, panchakarma, shirodhara, therapy"
        },
        # 9. Fitness & Gym 1
        {
            "owner": owner_accounts[5],
            "name": "IronCore Fitness & Crossfit Studio",
            "category": "Fitness & Gym",
            "description": "High-intensity functional training studio with Olympic lifting platforms, kettlebells, personal trainers, spinning bikes, and group HIIT classes.",
            "address": "50, Dr. Vishnuvardhan Road, Channasandra",
            "city": "Bengaluru",
            "lat": 12.8950,
            "lon": 77.5160,
            "phone": "+91 98451 77665",
            "email": "fit@ironcorestudio.in",
            "website": "https://ironcorestudio.in",
            "opening_hours": "Mon-Sat: 5:30 AM - 10:00 PM, Sun: 7:00 AM - 1:00 PM",
            "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
            "tags": "gym, crossfit, fitness, workout, personal trainer, hiit"
        },
        # 10. Fitness & Gym 2
        {
            "owner": owner_accounts[5],
            "name": "Prana Yoga & Meditation Sanctuary",
            "category": "Fitness & Gym",
            "description": "Holistic Hatha and Vinyasa Yoga center focusing on breathwork, flexibility, mindfulness, and stress management in a serene bamboo-decked studio.",
            "address": "8, 2nd Main, BEML Layout 5th Stage, RR Nagar",
            "city": "Bengaluru",
            "lat": 12.9110,
            "lon": 77.5190,
            "phone": "+91 98452 88776",
            "email": "namaste@pranayoga.org",
            "website": "https://pranayoga.org",
            "opening_hours": "Mon-Sat: 6:00 AM - 11:30 AM, 4:30 PM - 8:30 PM",
            "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
            "tags": "yoga, meditation, flexibility, mindfulness, wellness"
        },
        # 11. Electronics & Repair 1
        {
            "owner": owner_accounts[4],
            "name": "TechFix Express Gadget Care",
            "category": "Electronics & Repair",
            "description": "Fast chip-level repair for Apple MacBooks, iPhones, Dell, Lenovo, and Android devices. Screen replacement in under 60 minutes with 6 months warranty.",
            "address": "62, Temple Road, BEML Layout, RR Nagar",
            "city": "Bengaluru",
            "lat": 12.9060,
            "lon": 77.5200,
            "phone": "+91 98455 33221",
            "email": "support@techfixexpress.com",
            "website": "https://techfixexpress.com",
            "opening_hours": "Mon-Sat: 10:00 AM - 9:00 PM",
            "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",
            "tags": "laptop repair, phone repair, screen fix, apple, electronics"
        },
        # 12. Restaurants & Cafes (New)
        {
            "owner": owner_accounts[3],
            "name": "Brew & Bean Artisan Coffee House",
            "category": "Restaurants & Cafes",
            "description": "Specialty micro-roastery and serene community workspace serving pour-over single origins, avocado sourdough toast, cold brews, and fresh cinnamon rolls.",
            "address": "14, 5th Cross, Ideal Homes Township, RR Nagar",
            "city": "Bengaluru",
            "lat": 12.9055,
            "lon": 77.5218,
            "phone": "+91 80 2860 9944",
            "email": "hello@brewandbeancafe.in",
            "website": "https://brewandbeancafe.in",
            "opening_hours": "Mon-Sun: 7:30 AM - 10:30 PM",
            "image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
            "tags": "cafe, artisan coffee, breakfast, cold brew, workspace, pastries"
        },
        # 13. Restaurants & Cafes (New - Near RNSIT)
        {
            "owner": owner_accounts[1],
            "name": "Udupi Vaibhav Heritage Tiffin Room",
            "category": "Restaurants & Cafes",
            "description": "Legendary student and family breakfast spot 200m from RNSIT Gate. Authentic Davangere benne dosa, piping hot crispy vadas, kesari bath, and strong degree filter coffee.",
            "address": "8, Channasandra Main Road, 200m from RNSIT Gate",
            "city": "Bengaluru",
            "lat": 12.8975,
            "lon": 77.5165,
            "phone": "+91 98452 33441",
            "email": "contact@udupivaibhav.in",
            "website": "https://udupivaibhav.in",
            "opening_hours": "Mon-Sun: 6:30 AM - 10:30 PM",
            "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
            "tags": "south indian, benne dosa, tiffin, filter coffee, breakfast, rnsit"
        },
        # 14. Grocery & Supermarket (New)
        {
            "owner": owner_accounts[2],
            "name": "Nandi Organics & Farm Fresh Market",
            "category": "Grocery & Supermarket",
            "description": "Certified organic heirloom vegetables, pesticide-free local fruits, cold-pressed oils, unpolished native millets, and Vedic A2 bilona cow ghee.",
            "address": "51, Jawaharlal Nehru Road, RR Nagar",
            "city": "Bengaluru",
            "lat": 12.9028,
            "lon": 77.5188,
            "phone": "+91 98456 77889",
            "email": "orders@nandiorganics.in",
            "website": "https://nandiorganics.in",
            "opening_hours": "Mon-Sun: 7:00 AM - 9:30 PM",
            "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
            "tags": "organic, vegetables, a2 ghee, millets, farm fresh, cold pressed"
        },
        # 15. Grocery & Supermarket (New)
        {
            "owner": owner_accounts[4],
            "name": "DailyBasket Superstore & Gourmet Hub",
            "category": "Grocery & Supermarket",
            "description": "Modern neighborhood supermarket featuring international imported gourmet snacks, artisan cheeses, fresh dairy, household pantry essentials, and fast checkout.",
            "address": "102, Near RR Nagar Metro Station, Outer Ring Road",
            "city": "Bengaluru",
            "lat": 12.9170,
            "lon": 77.5280,
            "phone": "+91 80 2860 5511",
            "email": "support@dailybasketmart.in",
            "website": "https://dailybasketmart.in",
            "opening_hours": "Mon-Sun: 7:00 AM - 10:30 PM",
            "image": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80",
            "tags": "supermarket, gourmet, dairy, metro, grocery, snacks"
        },
        # 16. Restaurants & Cafes (New)
        {
            "owner": owner_accounts[0],
            "name": "The Coastal Bay Seafood & Grill",
            "category": "Restaurants & Cafes",
            "description": "Authentic coastal Karnataka seafood kitchen famous for Kundapura chicken ghee roast, neer dosa, surmai tawa fry, and aromatic fish curry.",
            "address": "72, BEML Layout 5th Stage, RR Nagar",
            "city": "Bengaluru",
            "lat": 12.9090,
            "lon": 77.5240,
            "phone": "+91 80 2860 8822",
            "email": "dine@coastalbaygrill.com",
            "website": "https://coastalbaygrill.com",
            "opening_hours": "Mon-Sun: 12:00 PM - 3:30 PM, 7:00 PM - 11:00 PM",
            "image": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
            "tags": "coastal, seafood, ghee roast, dinner, family dining"
        },
        # 17. Grocery & Supermarket (New - Near RNSIT)
        {
            "owner": owner_accounts[7],
            "name": "GreenLeaf Agro & Dairy Mart",
            "category": "Grocery & Supermarket",
            "description": "Farm-direct milk and dairy depot supplying raw farm milk, fresh malai paneer, thick curd, country eggs, and seasonal farm vegetables harvested daily at dawn.",
            "address": "19, RNSIT College Road, Channasandra",
            "city": "Bengaluru",
            "lat": 12.8995,
            "lon": 77.5150,
            "phone": "+91 98458 11223",
            "email": "care@greenleafmart.in",
            "website": "https://greenleafmart.in",
            "opening_hours": "Mon-Sun: 6:00 AM - 9:00 PM",
            "image": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80",
            "tags": "dairy, a2 milk, paneer, rnsit, fresh vegetables, groceries"
        },
        # 14. Retail & Fashion 1
        {
            "owner": owner_accounts[0],
            "name": "Vogue Heritage Handloom & Silk Boutique",
            "category": "Retail & Fashion",
            "description": "Authentic Mysore silk sarees, Kanjivaram bridal silks, handcrafted linen kurtas, and custom embroidery tailored for celebrations and festivals.",
            "address": "90, 80 Feet Road, Ideal Homes, RR Nagar",
            "city": "Bengaluru",
            "lat": 12.9020,
            "lon": 77.5225,
            "phone": "+91 98450 55443",
            "email": "sales@vogueheritagesilks.com",
            "website": "https://vogueheritagesilks.com",
            "opening_hours": "Mon-Sun: 10:30 AM - 9:00 PM",
            "image": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
            "tags": "silk sarees, handloom, ethnic wear, bridal, fashion, boutique"
        },
        # 15. Bakery & Sweets 1
        {
            "owner": owner_accounts[6],
            "name": "Anand Traditional Sweets & Savouries",
            "category": "Bakery & Sweets",
            "description": "Pure ghee Mysore Pak, Kaju Katli, traditional Dharwad Peda, piping hot samosas, and regional festive savory snacks prepared fresh everyday.",
            "address": "5, Kengeri Bus Terminal Ring Road",
            "city": "Bengaluru",
            "lat": 12.9180,
            "lon": 77.4810,
            "phone": "+91 80 2861 2233",
            "email": "orders@anandsweetsbengaluru.in",
            "website": "https://anandsweetsbengaluru.in",
            "opening_hours": "Mon-Sun: 8:30 AM - 10:00 PM",
            "image": "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80",
            "tags": "sweets, mysore pak, snacks, savouries, mithai, festival"
        },
        # 16. Retail & Sports 1
        {
            "owner": owner_accounts[5],
            "name": "Stride Sports & Activewear",
            "category": "Retail & Fashion",
            "description": "Authorized retailer for running shoes, badminton racquets, cricket gear, breathable activewear, and expert racquet stringing services.",
            "address": "14, Banashankari 3rd Stage, Outer Ring Road",
            "city": "Bengaluru",
            "lat": 12.9230,
            "lon": 77.5450,
            "phone": "+91 98453 66778",
            "email": "store@stridesports.in",
            "website": "https://stridesports.in",
            "opening_hours": "Mon-Sat: 10:00 AM - 9:30 PM",
            "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
            "tags": "shoes, sports, running, badminton, cricket, activewear"
        }
    ]

    seeded_businesses = []
    for b_info in businesses_data:
        b = Business(
            owner_id=b_info["owner"].id,
            name=b_info["name"],
            category=b_info["category"],
            description=b_info["description"],
            address=b_info["address"],
            city=b_info["city"],
            latitude=b_info["lat"],
            longitude=b_info["lon"],
            phone=b_info["phone"],
            email=b_info["email"],
            website=b_info["website"],
            opening_hours=b_info["opening_hours"],
            image_url=b_info["image"],
            tags=b_info["tags"],
            is_approved=True,
            is_suspended=False
        )
        db.add(b)
        seeded_businesses.append(b)

    db.commit()

    print("Seeding promotional offers and upcoming local events...")
    now = datetime.utcnow()
    two_weeks_ago = now - timedelta(days=14)
    next_month = now + timedelta(days=30)
    next_two_months = now + timedelta(days=60)

    # Offers for primary business ("The Bengaluru Bistro")
    bistro = seeded_businesses[0]
    db.add(Offer(
        business_id=bistro.id,
        title="Weekend Rooftop Sunset Special: 20% Off All Pastas & Craft Mocktails",
        description="Indulge in our signature hand-rolled pastas and artisanal drinks while soaking in the golden hour view. Valid Friday to Sunday.",
        discount_code="SUNSET20",
        discount_percent=20.0,
        start_date=two_weeks_ago,
        end_date=next_month,
        is_event=False,
        banner_url="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        is_active=True,
        clicks_count=48
    ))
    db.add(Offer(
        business_id=bistro.id,
        title="Live Acoustic Jazz & Indie Night: Bengaluru Unplugged",
        description="Join us this Saturday night for live sets by homegrown indie musicians, coupled with gourmet small plates and craft coffee.",
        discount_code="JAZZNIGHT",
        discount_percent=10.0,
        start_date=now - timedelta(days=2),
        end_date=now + timedelta(days=10),
        is_event=True,
        banner_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
        is_active=True,
        clicks_count=32
    ))
    db.add(Offer(
        business_id=bistro.id,
        title="Weekday Corporate Lunch Combo @ ₹299 Only",
        description="Special 3-course executive meal box for tech professionals and teams around RR Nagar and Global Tech Village.",
        discount_code="CORP299",
        discount_percent=15.0,
        start_date=two_weeks_ago,
        end_date=next_two_months,
        is_event=False,
        is_active=True,
        clicks_count=21
    ))

    # Offers for other businesses
    offers_pool = [
        (1, "Unlimited Filter Coffee with Ghee Masala Dosa Combo", "DOZALOVE", 15.0, False, "Every weekday morning 7am-10am. Pure South Indian breakfast bliss!"),
        (2, "Buy 1 Artisanal Sourdough Loaf, Get 1 Cinnamon Roll Free", "SWEETROLL", 25.0, False, "Baked fresh every morning at 7:30 AM."),
        (4, "Flat 15% Off on All Farm-Fresh Organic Millets & Cold Pressed Oils", "ORGANIC15", 15.0, False, "Direct from Karnataka certified farmers."),
        (6, "Full Hair Spa + Scalp Detox Treatment at ₹799 (Flat 35% Off)", "GLOW35", 35.0, False, "Pamper yourself with our signature hair care package."),
        (8, "1 Month Free on Annual Gym & Crossfit Membership", "FIT2026", 20.0, False, "Includes 2 complimentary personal trainer sessions and nutrition chart."),
        (10, "Free Laptop Diagnostic Check & Internal Thermal Cleaning", "TECHCLEAN", 50.0, False, "Speed up your work laptop in under 45 minutes."),
        (11, "Buy 1 Artisanal Pour-over, Get 1 Cinnamon Roll Free", "BREWROLL", 20.0, False, "Roasted fresh daily. Perfect for students and work-from-cafe neighbors!"),
        (12, "Student & Neighbor Benne Dosa + Filter Coffee @ ₹79", "RNSIT79", 25.0, False, "Authentic Davangere butter dosa with strong degree coffee."),
        (13, "Flat 15% Off Organic Millets & Cold Pressed Mustard Oil", "NANDI15", 15.0, False, "Direct from certified local Karnataka farm cooperatives."),
        (14, "Weekend Super Mart Discount: Flat ₹150 Off on ₹999", "BASKET150", 15.0, False, "All groceries, daily essentials, and imported gourmet snacks.")
    ]

    for b_idx, title, code, pct, is_ev, desc in offers_pool:
        if b_idx < len(seeded_businesses):
            target_b = seeded_businesses[b_idx]
            db.add(Offer(
                business_id=target_b.id,
                title=title,
                description=desc,
                discount_code=code,
                discount_percent=pct,
                start_date=two_weeks_ago,
                end_date=next_month,
                is_event=is_ev,
                is_active=True,
                clicks_count=random.randint(12, 60)
            ))

    db.commit()

    print("Seeding customer reviews with ML sentiment classification...")
    # Curated realistic reviews with express comments
    sample_reviews = [
        # Reviews for The Bengaluru Bistro
        (bistro.id, 0, 5, "Unbelievable sunset view and artisanal pizza!", "The rooftop ambience in the evening is truly unmatched in South Bangalore. The wood-fired truffle pizza and iced filter coffee were top notch! Friendly staff too."),
        (bistro.id, 1, 5, "Cozy atmosphere and great music", "Perfect place to work on laptop in the afternoon and chill with friends by evening. Fast wifi, polite staff, and delicious aglio olio pasta!"),
        (bistro.id, 2, 4, "Great food, slightly busy on weekends", "We had a wonderful dinner here last Friday. The rooftop breeze is lovely. Only slight wait time for a table, but the food quality made up for it."),
        (bistro.id, 3, 5, "Best cafe experience in RR Nagar", "Visited for their live acoustic jazz night. Exceptional vibes, delicious dessert platter, and courteous management. Highly recommend!"),
        (bistro.id, 4, 2, "A bit noisy and delayed dessert", "Food tasted nice but the service was slow because it was very crowded on Saturday night. Waited 25 minutes for dessert. Hope they improve staffing."),
        (bistro.id, 5, 5, "Outstanding tiramisu and warm hospitality", "One of the best tiramisus I have had in Bangalore. Vikram and the team take great personal care of guests. Will definitely visit again!"),
        (bistro.id, 6, 4, "Loved the iced cold brew", "Smooth specialty coffee and very clean hygiene standards. Beautiful interior decor."),

        # Reviews for Udupi Grand Sagar
        (seeded_businesses[1].id, 1, 5, "Legendary crispy ghee roast dosa", "Always consistent taste! The coconut chutney and piping hot sambar with crisp dosa is unbeatable. Quick service."),
        (seeded_businesses[1].id, 2, 5, "Authentic breakfast favorite", "Best filter coffee in the area. Pocket friendly prices and super clean kitchen."),
        (seeded_businesses[1].id, 3, 3, "Very crowded on Sunday mornings", "Food is tasty but standing in long queue during peak breakfast hours is tiring."),

        # Reviews for Green Valley Organic Mart
        (seeded_businesses[4].id, 0, 5, "Genuine organic produce", "The spinach and heirloom tomatoes stay fresh for over a week! Very helpful staff and transparent pricing."),
        (seeded_businesses[4].id, 2, 5, "Great selection of millets and cold pressed oils", "Supermarket is well organized and staff helped me pick cold pressed sesame oil. Excellent quality."),
        (seeded_businesses[4].id, 4, 2, "Slightly expensive compared to normal market", "Quality is good but the prices on organic exotic vegetables are higher than expected."),

        # Reviews for Glow & Grace Salon
        (seeded_businesses[6].id, 1, 5, "Amazing haircut and spa treatment", "Stylist gave me the exact layered cut I requested. Professional salon products and relaxing head massage. 10/10!"),
        (seeded_businesses[6].id, 3, 4, "Clean and hygienic salon", "Courteous beauticians, sanitised tools, and relaxing ambience. Will return."),
        (seeded_businesses[6].id, 5, 1, "Disappointed with waiting time", "Had a confirmed appointment at 3 PM but had to wait for 30 minutes before stylist was free. Poor scheduling."),

        # Reviews for IronCore Fitness
        (seeded_businesses[8].id, 0, 5, "Best functional gym in Bangalore", "Top tier equipment, motivating trainers, and energetic community. Down 5 kgs in two months!"),
        (seeded_businesses[8].id, 2, 4, "Great trainers and spacious floor", "Clean shower rooms and modern weights. Crossfit sessions in the morning are super intense."),

        # Reviews for TechFix Express
        (seeded_businesses[10].id, 1, 5, "Screen replaced in 40 minutes!", "Saved my MacBook Pro screen after I dropped it. Honest technicians and fair pricing with warranty card."),
        (seeded_businesses[10].id, 3, 2, "Repair took a day longer than promised", "They fixed the keyboard issue properly, but part delivery was delayed by one full day.")
    ]

    for b_id, cust_idx, rating, title, comment in sample_reviews:
        cust = customer_accounts[cust_idx % len(customer_accounts)]
        analysis = sentiment_analyzer.analyze(comment)
        
        # Consistent label
        sent = "positive" if rating >= 4 else ("negative" if rating <= 2 else analysis["sentiment"])
        score = analysis["confidence"]

        # Spread timestamps over past 20 days
        days_ago = random.randint(1, 20)
        review_time = now - timedelta(days=days_ago, hours=random.randint(1, 10))

        rev = Review(
            business_id=b_id,
            user_id=cust.id,
            rating=rating,
            title=title,
            comment=comment,
            sentiment=sent,
            sentiment_score=score,
            is_flagged=False,
            is_hidden=False,
            created_at=review_time
        )
        db.add(rev)

    db.commit()

    print("Seeding search logs and view logs to power demand analytics and heatmaps...")
    categories_list = [
        "Restaurants & Cafes", "Grocery & Supermarket", "Salons & Spas", 
        "Fitness & Gym", "Electronics & Repair", 
        "Retail & Fashion", "Bakery & Sweets"
    ]
    popular_queries = [
        ("rooftop cafe", "Restaurants & Cafes"),
        ("masala dosa", "Restaurants & Cafes"),
        ("italian pasta", "Restaurants & Cafes"),
        ("organic vegetables", "Grocery & Supermarket"),
        ("hair salon haircut", "Salons & Spas"),
        ("crossfit gym", "Fitness & Gym"),
        ("laptop repair", "Electronics & Repair"),
        ("artisan coffee", "Restaurants & Cafes"),
        ("farm fresh dairy", "Grocery & Supermarket"),
        ("mysore silk saree", "Retail & Fashion"),
        ("sourdough bread", "Bakery & Sweets"),
        ("filter coffee", "Restaurants & Cafes")
    ]

    # Generate 350 search logs over past 14 days with realistic hour distributions:
    # Evening (5pm - 9pm) highest, Lunch (12pm - 2pm) medium, Morning (8am - 10am) medium, Night (11pm - 6am) low
    for _ in range(350):
        days_back = random.randint(0, 13)
        # Weighted hours
        hour_weights = [1, 1, 1, 1, 1, 2, 3, 5, 8, 9, 7, 8, 12, 13, 8, 7, 9, 14, 18, 20, 16, 12, 6, 2]
        hour = random.choices(range(24), weights=hour_weights)[0]
        minute = random.randint(0, 59)
        ts = datetime.combine(now.date() - timedelta(days=days_back), datetime.min.time()) + timedelta(hours=hour, minutes=minute)

        q_item = random.choice(popular_queries)
        c_user = random.choice(customer_accounts)

        db.add(SearchLog(
            user_id=c_user.id if random.random() > 0.25 else None,
            query=q_item[0],
            category=q_item[1],
            latitude=12.8988 + random.uniform(-0.02, 0.02),
            longitude=77.5186 + random.uniform(-0.02, 0.02),
            timestamp=ts,
            hour_of_day=hour,
            day_of_week=ts.weekday()
        ))

    # Generate 450 view logs for businesses over past 14 days (with heavy view concentration on bistro)
    for _ in range(450):
        days_back = random.randint(0, 13)
        hour_weights = [1, 1, 1, 1, 1, 2, 4, 6, 8, 10, 8, 9, 14, 15, 9, 8, 11, 16, 22, 24, 18, 12, 5, 2]
        hour = random.choices(range(24), weights=hour_weights)[0]
        minute = random.randint(0, 59)
        ts = datetime.combine(now.date() - timedelta(days=days_back), datetime.min.time()) + timedelta(hours=hour, minutes=minute)

        # 40% probability for the bistro to ensure rich owner dashboard data
        if random.random() < 0.40:
            target_business = bistro
        else:
            target_business = random.choice(seeded_businesses)

        c_user = random.choice(customer_accounts)
        db.add(ViewLog(
            business_id=target_business.id,
            user_id=c_user.id if random.random() > 0.3 else None,
            timestamp=ts,
            hour_of_day=hour,
            day_of_week=ts.weekday()
        ))

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_database()
