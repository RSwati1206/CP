import re
from flask import Blueprint, request, jsonify, g
from backend.database import SessionLocal
from backend.models import User, Business
from backend.auth.utils import generate_token, token_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    role = data.get('role') or 'customer'
    phone = (data.get('phone') or '').strip()
    address = (data.get('address') or '').strip()

    # Validation
    if not name or len(name) < 2:
        return jsonify({"error": "Full name must be at least 2 characters long"}), 400

    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({"error": "Please provide a valid email address"}), 400

    if not password or len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long"}), 400

    if role not in ['customer', 'business_owner']:
        return jsonify({"error": "Role must be either 'customer' or 'business_owner'"}), 400

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            return jsonify({"error": "An account with this email already exists"}), 409

        new_user = User(
            name=name,
            email=email,
            role=role,
            phone=phone if phone else None,
            address=address if address else None
        )
        new_user.set_password(password)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = generate_token(new_user.id, new_user.role)
        return jsonify({
            "message": "Registration successful",
            "token": token,
            "user": new_user.to_dict()
        }), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": f"Failed to register user: {str(e)}"}), 500
    finally:
        db.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid email or password"}), 401

        if not user.is_active:
            return jsonify({"error": "Your account has been deactivated. Please contact support."}), 403

        token = generate_token(user.id, user.role)
        
        # If business owner, return their primary business id if one exists
        business_id = None
        if user.role == 'business_owner':
            b = db.query(Business).filter(Business.owner_id == user.id).first()
            if b:
                business_id = b.id

        user_data = user.to_dict()
        user_data["business_id"] = business_id

        return jsonify({
            "message": "Login successful",
            "token": token,
            "user": user_data
        }), 200
    finally:
        db.close()

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == g.user_id).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        business_id = None
        if user.role == 'business_owner':
            b = db.query(Business).filter(Business.owner_id == user.id).first()
            if b:
                business_id = b.id

        user_data = user.to_dict()
        user_data["business_id"] = business_id

        return jsonify({"user": user_data}), 200
    finally:
        db.close()
