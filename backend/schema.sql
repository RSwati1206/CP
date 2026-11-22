-- =========================================================================
-- Local Business Promotion and Market Analytics Portal
-- PostgreSQL Database Schema Definition
-- =========================================================================

-- Drop tables if already existing (in correct dependency order)
DROP TABLE IF EXISTS offer_clicks CASCADE;
DROP TABLE IF EXISTS view_logs CASCADE;
DROP TABLE IF EXISTS search_logs CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'business_owner', 'admin')),
    phone VARCHAR(30),
    address VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. Businesses Table
CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Bengaluru',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(150),
    website VARCHAR(255),
    opening_hours TEXT,
    image_url TEXT,
    tags VARCHAR(255),
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_businesses_coords ON businesses(latitude, longitude);
CREATE INDEX idx_businesses_owner ON businesses(owner_id);

-- 3. Offers & Events Table
CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    discount_code VARCHAR(50),
    discount_percent DOUBLE PRECISION,
    start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    is_event BOOLEAN NOT NULL DEFAULT FALSE,
    banner_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    clicks_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offers_business ON offers(business_id);
CREATE INDEX idx_offers_validity ON offers(is_active, start_date, end_date);

-- 4. Customer Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(150),
    comment TEXT NOT NULL,
    sentiment VARCHAR(20) NOT NULL DEFAULT 'positive' CHECK (sentiment IN ('positive', 'negative')),
    sentiment_score DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_business ON reviews(business_id);
CREATE INDEX idx_reviews_sentiment ON reviews(sentiment);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- 5. Search Analytics Logs
CREATE TABLE search_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    query VARCHAR(255),
    category VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    hour_of_day INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL
);

CREATE INDEX idx_search_category ON search_logs(category);
CREATE INDEX idx_search_time ON search_logs(hour_of_day, day_of_week);

-- 6. Business View Logs
CREATE TABLE view_logs (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    hour_of_day INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL
);

CREATE INDEX idx_view_business ON view_logs(business_id);
CREATE INDEX idx_view_time ON view_logs(hour_of_day, day_of_week);

-- 7. Offer Clicks Logs
CREATE TABLE offer_clicks (
    id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offer_clicks ON offer_clicks(offer_id);
