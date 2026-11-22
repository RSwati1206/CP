import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, g
from backend.config import Config
from backend.database import SessionLocal
from backend.models import User

def generate_token(user_id, role, expires_in_days=7):
    """Generates a secure JWT token for a user."""
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(days=expires_in_days),
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")

def decode_token(token):
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to require a valid JWT token on an endpoint."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"error": "Authorization token is missing"}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return jsonify({"error": "Invalid Authorization header format. Expected 'Bearer <token>'"}), 401

        token = parts[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Token is invalid or expired"}), 401

        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == payload["user_id"]).first()
            if not user or not user.is_active:
                return jsonify({"error": "User account not found or suspended"}), 403
            g.current_user = user
            g.user_id = user.id
            g.user_role = user.role
        finally:
            db.close()

        return f(*args, **kwargs)
    return decorated

def optional_token(f):
    """Optional token decorator for public endpoints that track logged-in users if present."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        g.current_user = None
        g.user_id = None
        g.user_role = None
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == "bearer":
                payload = decode_token(parts[1])
                if payload:
                    db = SessionLocal()
                    try:
                        user = db.query(User).filter(User.id == payload["user_id"]).first()
                        if user and user.is_active:
                            g.current_user = user
                            g.user_id = user.id
                            g.user_role = user.role
                    finally:
                        db.close()
        return f(*args, **kwargs)
    return decorated

def role_required(allowed_roles):
    """Decorator to enforce role permissions on an endpoint."""
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated_function(*args, **kwargs):
            if g.user_role not in allowed_roles:
                return jsonify({
                    "error": f"Access denied. Requires one of the following roles: {', '.join(allowed_roles)}"
                }), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
