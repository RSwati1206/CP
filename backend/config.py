import os

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "local_business_portal_super_secret_key_2026")
    JWT_SECRET = os.getenv("JWT_SECRET", "local_business_jwt_secret_token_key_2026")
    
    # Primary: PostgreSQL. Default/Fallback: SQLite for zero-setup execution
    # Example PostgreSQL URL: postgresql+psycopg2://postgres:password@localhost:5432/local_promo_db
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        # Default to local sqlite file in backend directory
        base_dir = os.path.abspath(os.path.dirname(__file__))
        DATABASE_URL = f"sqlite:///{os.path.join(base_dir, 'local_promo_v2.db')}"
    elif DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg2://", 1)

    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Default city context: Bengaluru / RNSIT
    DEFAULT_LATITUDE = 12.8988
    DEFAULT_LONGITUDE = 77.5186
