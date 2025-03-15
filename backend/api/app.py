from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
import os

app = Flask(__name__)
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:Anvitha%402024@localhost:3306/employee_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

db = SQLAlchemy(app)
jwt = JWTManager(app)

# Models
class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    position = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    hire_date = db.Column(db.Date)

# Routes
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        admin = Admin.query.filter_by(username=username).first()
        if admin and admin.password == password:  # In production, use proper password hashing
            access_token = create_access_token(identity=username)
            return jsonify({'token': access_token}), 200
        return jsonify({'message': 'Invalid credentials'}), 401
    except Exception as e:
        print(f"Login error: {str(e)}")
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
        # Create default admin if not exists
        if not Admin.query.filter_by(username='admin').first():
            default_admin = Admin(username='admin', password='admin123')
            db.session.add(default_admin)
            db.session.commit()
    app.run(debug=True, port=5001)
