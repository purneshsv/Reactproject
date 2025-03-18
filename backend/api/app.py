from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from google.oauth2 import id_token
from google.auth.transport import requests
from datetime import timedelta
from dotenv import load_dotenv
import os
import bcrypt

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')  # Secure JWT Key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

db = SQLAlchemy(app)
jwt = JWTManager(app)

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')  # Google Client ID

# Models
class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    position = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    hire_date = db.Column(db.Date)
    

# Google Token Verification Function
def verify_google_token(token):
    try:
        payload = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        return payload  # Returns user info if valid
    except Exception as e:
        print(f"Google token verification failed: {str(e)}")
        return None

# Routes
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        admin = Admin.query.filter_by(username=username).first()
        if admin and admin.check_password(password):
            access_token = create_access_token(identity=username)
            return jsonify({'token': access_token}), 200
        return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'message': 'Server error'}), 500

@app.route('/api/auth/google', methods=['POST'])
def google_login():
    try:
        data = request.get_json()
        token = data.get('token')
        simulator_test = data.get('simulatorTest', False)

        if not token:
            return jsonify({'message': 'No token provided'}), 400

        # Handle simulator testing mode
        if simulator_test:
            print(f"Simulator testing mode detected")
            # Create a mock Google user for simulator testing
            google_user = {
                'email': 'simulator.test@example.com',
                'name': 'Simulator Test User',
                'sub': 'simulator-test-user-id'
            }
        else:
            print(f"Received Google Token: {token[:20]}...")  # Truncated for security
            google_user = verify_google_token(token)
            
        if not google_user:
            print("Google Token Verification Failed")
            return jsonify({'message': 'Invalid Google token'}), 401

        email = google_user.get('email')
        if not email:
            print("Google user has no email")
            return jsonify({'message': 'Google account must have an email'}), 400

        print(f"Google User Verified: {email}")

        # Check if admin exists
        admin = Admin.query.filter_by(username=email).first()

        # If user does not exist, create one
        if not admin:
            print(f"Creating new admin for email: {email}")
            admin = Admin(username=email)
            admin.set_password('google_auth_user')  # Assign a placeholder password
            db.session.add(admin)
            db.session.commit()

        # Generate JWT token for the user
        access_token = create_access_token(identity=email)
        print(f"Generated JWT Token for {email}")

        return jsonify({'token': access_token}), 200
    except Exception as e:
        print(f"Google login error: {str(e)}")
        return jsonify({'message': 'Server error'}), 500
    
@app.route('/api/employees', methods=['GET'])
@jwt_required()
def get_employees():
    try:
        employees = Employee.query.all()
        return jsonify([{
            'id': e.id,
            'name': e.name,
            'email': e.email,
            'position': e.position,
            'department': e.department,
            'phone': e.phone,
            'hire_date': e.hire_date.strftime('%Y-%m-%d') if e.hire_date else None
        } for e in employees])
    except Exception as e:
        print(f"Get employees error: {str(e)}")
        return jsonify({'message': 'Server error'}), 500

@app.route('/api/employees', methods=['POST'])
@jwt_required()
def add_employee():
    try:
        data = request.get_json()

        if Employee.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already exists'}), 400

        new_employee = Employee(
            name=data['name'],
            email=data['email'],
            position=data['position'],
            department=data['department'],
            phone=data.get('phone'),
            hire_date=data.get('hire_date')
        )
        db.session.add(new_employee)
        db.session.commit()
        return jsonify({'message': 'Employee added successfully'}), 201
    except Exception as e:
        print(f"Add employee error: {str(e)}")
        db.session.rollback()
        return jsonify({'message': 'Server error'}), 500

@app.route('/api/employees/<int:id>', methods=['PUT'])
@jwt_required()
def update_employee(id):
    try:
        employee = Employee.query.get_or_404(id)
        data = request.get_json()

        employee.name = data.get('name', employee.name)
        employee.email = data.get('email', employee.email)
        employee.position = data.get('position', employee.position)
        employee.department = data.get('department', employee.department)
        employee.phone = data.get('phone', employee.phone)
        employee.hire_date = data.get('hire_date', employee.hire_date)

        db.session.commit()
        return jsonify({'message': 'Employee updated successfully'})
    except Exception as e:
        print(f"Update employee error: {str(e)}")
        db.session.rollback()
        return jsonify({'message': 'Server error'}), 500

@app.route('/api/employees/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_employee(id):
    try:
        employee = Employee.query.get_or_404(id)
        db.session.delete(employee)
        db.session.commit()
        return jsonify({'message': 'Employee deleted successfully'})
    except Exception as e:
        print(f"Delete employee error: {str(e)}")
        db.session.rollback()
        return jsonify({'message': 'Server error'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not Admin.query.filter_by(username='admin').first():
            default_admin = Admin(username='admin')
            default_admin.set_password('admin123')  # Securely hash password
            db.session.add(default_admin)
            db.session.commit()
    app.run(debug=True, port=5001)