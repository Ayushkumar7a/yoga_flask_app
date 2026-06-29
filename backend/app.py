import os
import json
import jwt
import sqlite3
import sys
from datetime import datetime, timedelta
from functools import wraps
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import (
    create_tables, add_user, verify_user, get_user_profile, 
    update_profile, save_yoga_log, get_logs, get_achievements, 
    get_dashboard_stats, save_feedback, get_feedbacks, delete_feedback,
    get_tutorials, add_tutorial, delete_tutorial, DB_NAME
)
from utils import generate_pdf_report

app = Flask(__name__)
app.config['SECRET_KEY'] = 'yoga_super_secret_portfolio_key'
# Enable CORS for frontend development
CORS(app)

SECRET_KEY = app.config['SECRET_KEY']

# Decorator to secure REST routes with JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            token = request.args.get('token')
            
        if not token:
            return jsonify({'message': 'Access token is missing!'}), 401
        
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = data['username']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Access token expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid access token!'}), 401
        except Exception as e:
            return jsonify({'message': 'Authentication failed!', 'error': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated


# Helper to load the 30+ pose database
def load_pose_db():
    try:
        with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pose_db.json'), 'r') as file:
            return json.load(file)
    except Exception as e:
        print("Error loading pose database:", e)
        return []


# ---------------------------------------------------------
# AUTHENTICATION ROUTES
# ---------------------------------------------------------

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username and password are required!'}), 400
        
    username = data.get('username')
    password = data.get('password')
    
    # Optional profile details
    age = data.get('age')
    height = data.get('height')
    weight = data.get('weight')
    fitness_level = data.get('fitness_level', 'Beginner')
    goal = data.get('goal', 'Flexibility')
    
    success = add_user(username, password, age, height, weight, fitness_level, goal)
    if success:
        return jsonify({'message': 'User registered successfully!'}), 201
    else:
        return jsonify({'message': 'Username already exists!'}), 400


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Username and password are required!'}), 400
        
    username = data.get('username')
    password = data.get('password')
    
    if verify_user(username, password):
        # Generate JWT token valid for 24 hours
        token = jwt.encode({
            'username': username,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, SECRET_KEY, algorithm='HS256')
        
        return jsonify({
            'token': token,
            'username': username,
            'message': 'Login successful!'
        }), 200
    else:
        return jsonify({'message': 'Invalid username or password!'}), 401


@app.route('/api/auth/profile', methods=['GET', 'PUT'])
@token_required
def profile_endpoint(current_user):
    if request.method == 'GET':
        profile = get_user_profile(current_user)
        if profile:
            return jsonify(profile), 200
        return jsonify({'message': 'Profile not found!'}), 404
        
    elif request.method == 'PUT':
        data = request.get_json() or {}
        age = data.get('age')
        height = data.get('height')
        weight = data.get('weight')
        fitness_level = data.get('fitness_level', 'Beginner')
        goal = data.get('goal', 'Flexibility')
        
        update_profile(current_user, age, height, weight, fitness_level, goal)
        return jsonify({'message': 'Profile updated successfully!'}), 200


# ---------------------------------------------------------
# DASHBOARD & STATISTICS
# ---------------------------------------------------------

@app.route('/api/dashboard/stats', methods=['GET'])
@token_required
def dashboard_stats(current_user):
    stats = get_dashboard_stats(current_user)
    return jsonify(stats), 200


# ---------------------------------------------------------
# YOGA LIBRARY
# ---------------------------------------------------------

@app.route('/api/poses', methods=['GET'])
def get_poses():
    poses = load_pose_db()
    return jsonify(poses), 200


# ---------------------------------------------------------
# BMI CALCULATOR
# ---------------------------------------------------------

@app.route('/api/bmi', methods=['POST'])
def calculate_bmi():
    data = request.get_json() or {}
    weight = data.get('weight') # in kg
    height = data.get('height') # in cm
    
    if not weight or not height:
        return jsonify({'message': 'Weight (kg) and Height (cm) are required!'}), 400
        
    try:
        height_m = height / 100.0
        bmi = weight / (height_m * height_m)
        
        category = ""
        if bmi < 18.5:
            category = "Underweight"
            recommended_tags = ["Seated", "Core / Strength"]
        elif bmi < 25:
            category = "Normal Weight"
            recommended_tags = ["Standing", "Core", "Backbend"]
        elif bmi < 30:
            category = "Overweight"
            recommended_tags = ["Standing / Squat", "Standing", "Core / Strength"]
        else:
            category = "Obese"
            recommended_tags = ["Standing / Squat", "Restorative", "Seated"]
            
        # Select matching recommended poses
        all_poses = load_pose_db()
        recommended_poses = [p for p in all_poses if p['category'] in recommended_tags][:4]
        
        return jsonify({
            'bmi': round(bmi, 2),
            'category': category,
            'recommendedPoses': recommended_poses
        }), 200
    except Exception as e:
        return jsonify({'message': 'Failed to calculate BMI', 'error': str(e)}), 400


# ---------------------------------------------------------
# PERSONALIZED RECOMMENDATIONS
# ---------------------------------------------------------

@app.route('/api/recommendations', methods=['GET'])
@token_required
def get_recommendations(current_user):
    profile = get_user_profile(current_user)
    if not profile:
        return jsonify({'message': 'Profile details missing!'}), 400
        
    goal = profile.get('goal', 'Flexibility')
    fitness_level = profile.get('fitness_level', 'Beginner')
    
    all_poses = load_pose_db()
    
    # 1. Filter by Difficulty/Fitness Level
    # Beginner: Beginner only
    # Intermediate: Beginner + Intermediate
    # Advanced: All
    if fitness_level == 'Beginner':
        filtered = [p for p in all_poses if p['difficulty'] == 'Beginner']
    elif fitness_level == 'Intermediate':
        filtered = [p for p in all_poses if p['difficulty'] in ['Beginner', 'Intermediate']]
    else:
        filtered = all_poses
        
    # 2. Filter by Goals
    recommended = []
    if goal == 'Flexibility':
        recommended = [p for p in filtered if p['category'] in ['Standing', 'Seated', 'Standing / Hip Opener']]
    elif goal == 'Weight Loss':
        recommended = [p for p in filtered if p['category'] in ['Core / Strength', 'Core', 'Standing / Squat']]
    elif goal == 'Back Pain':
        recommended = [p for p in filtered if p['category'] in ['Backbend', 'Restorative']]
    elif goal == 'Stress Relief' or goal == 'Meditation' or goal == 'Better Sleep':
        recommended = [p for p in filtered if p['category'] in ['Restorative', 'Seated / Meditation']]
    else:
        recommended = filtered[:6]
        
    # If filter too tight, top-up
    if len(recommended) < 4:
        recommended = filtered[:6]
        
    return jsonify({
        'goal': goal,
        'fitnessLevel': fitness_level,
        'poses': recommended[:8]
    }), 200


# ---------------------------------------------------------
# PRACTICE LOGS
# ---------------------------------------------------------

@app.route('/api/logs', methods=['GET', 'POST'])
@token_required
def logs_endpoint(current_user):
    if request.method == 'GET':
        logs = get_logs(current_user)
        return jsonify(logs), 200
        
    elif request.method == 'POST':
        data = request.get_json() or {}
        pose_name = data.get('pose_name')
        reps = data.get('reps', 0)
        duration_seconds = data.get('duration_seconds', 0)
        accuracy = data.get('accuracy', 100)
        
        if not pose_name:
            return jsonify({'message': 'Pose name is required!'}), 400
            
        save_yoga_log(current_user, pose_name, reps, duration_seconds, accuracy)
        return jsonify({'message': 'Yoga log saved successfully!'}), 201


# ---------------------------------------------------------
# ACHIEVEMENTS
# ---------------------------------------------------------

@app.route('/api/achievements', methods=['GET'])
@token_required
def achievements_endpoint(current_user):
    achievements = get_achievements(current_user)
    return jsonify(achievements), 200


# ---------------------------------------------------------
# PDF PROGRESS REPORT GENERATION
# ---------------------------------------------------------

@app.route('/api/reports/pdf', methods=['GET'])
@token_required
def download_pdf(current_user):
    try:
        profile = get_user_profile(current_user) or {}
        stats = get_dashboard_stats(current_user)
        logs = get_logs(current_user)
        
        pdf_buffer = generate_pdf_report(current_user, profile, stats, logs)
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=f"FlexFlow_AI_Progress_Report_{current_user}.pdf",
            mimetype='application/pdf'
        )
    except Exception as e:
        return jsonify({'message': 'Failed to generate report', 'error': str(e)}), 500


# ---------------------------------------------------------
# ADMIN PANEL APIS
# ---------------------------------------------------------

@app.route('/api/admin/analytics', methods=['GET'])
@token_required
def admin_analytics(current_user):
    # Simple check: let's say username "admin" is the administrator
    if current_user != "admin":
         return jsonify({'message': 'Unauthorized! Admin access required.'}), 403
         
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM yoga_logs")
    total_workouts = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(accuracy) FROM yoga_logs")
    avg_accuracy = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT SUM(duration_seconds) FROM yoga_logs")
    total_seconds = cursor.fetchone()[0] or 0
    
    conn.close()
    
    return jsonify({
        'totalUsers': total_users,
        'totalWorkouts': total_workouts,
        'averageAccuracy': round(avg_accuracy, 2),
        'totalWorkoutMinutes': round(total_seconds / 60.0, 2)
    }), 200


@app.route('/api/admin/users', methods=['GET'])
@token_required
def admin_users(current_user):
    if current_user != "admin":
         return jsonify({'message': 'Unauthorized!'}), 403
         
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, age, height, weight, fitness_level, goal FROM users")
    users = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(users), 200


@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@token_required
def admin_delete_user(current_user, user_id):
    if current_user != "admin":
         return jsonify({'message': 'Unauthorized!'}), 403
         
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE id=?", (user_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'User deleted successfully!'}), 200


@app.route('/api/feedback', methods=['POST'])
@token_required
def submit_feedback(current_user):
    data = request.get_json() or {}
    email = data.get('email')
    message = data.get('message')
    rating = data.get('rating', 5)
    if not message:
        return jsonify({'message': 'Message is required'}), 400
    save_feedback(current_user, email, message, rating)
    return jsonify({'message': 'Feedback submitted successfully!'}), 201


@app.route('/api/admin/feedback', methods=['GET'])
@token_required
def admin_get_feedback(current_user):
    if current_user != "admin":
        return jsonify({'message': 'Unauthorized!'}), 403
    feedbacks = get_feedbacks()
    return jsonify(feedbacks), 200


@app.route('/api/admin/feedback/<int:feedback_id>', methods=['DELETE'])
@token_required
def admin_delete_feedback(current_user, feedback_id):
    if current_user != "admin":
        return jsonify({'message': 'Unauthorized!'}), 403
    delete_feedback(feedback_id)
    return jsonify({'message': 'Feedback deleted successfully!'}), 200


@app.route('/api/tutorials', methods=['GET'])
def api_get_tutorials():
    tutorials = get_tutorials()
    return jsonify(tutorials), 200


@app.route('/api/admin/tutorials', methods=['POST'])
@token_required
def admin_add_tutorial(current_user):
    if current_user != "admin":
        return jsonify({'message': 'Unauthorized!'}), 403
    data = request.get_json() or {}
    title = data.get('title')
    description = data.get('description', '')
    url = data.get('url')
    duration = data.get('duration', '')
    difficulty = data.get('difficulty', 'Beginner')
    if not title or not url:
        return jsonify({'message': 'Title and Link are required!'}), 400
    add_tutorial(title, description, url, duration, difficulty)
    return jsonify({'message': 'Tutorial added successfully!'}), 201


@app.route('/api/admin/tutorials/<int:tutorial_id>', methods=['DELETE'])
@token_required
def admin_delete_tutorial(current_user, tutorial_id):
    if current_user != "admin":
        return jsonify({'message': 'Unauthorized!'}), 403
    delete_tutorial(tutorial_id)
    return jsonify({'message': 'Tutorial deleted successfully!'}), 200


@app.route('/api/admin/poses', methods=['POST'])
@token_required
def admin_add_pose(current_user):
    if current_user != "admin":
        return jsonify({'message': 'Unauthorized!'}), 403
    data = request.get_json() or {}
    pose_id = data.get('id')
    name = data.get('name')
    if not pose_id or not name:
        return jsonify({'message': 'Pose ID and Name are required!'}), 400
        
    pose_db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pose_db.json')
    try:
        with open(pose_db_path, 'r', encoding='utf-8') as f:
            poses = json.load(f)
    except Exception:
        poses = []
        
    if any(p.get('id') == pose_id for p in poses):
        return jsonify({'message': 'Pose ID already exists!'}), 400
        
    new_pose = {
        "id": pose_id,
        "name": name,
        "difficulty": data.get('difficulty', 'Beginner'),
        "category": data.get('category', 'Standing'),
        "description": data.get('description', ''),
        "benefits": data.get('benefits', []),
        "precautions": data.get('precautions', []),
        "steps": data.get('steps', []),
        "common_mistakes": data.get('common_mistakes', [])
    }
    poses.append(new_pose)
    
    with open(pose_db_path, 'w', encoding='utf-8') as f:
        json.dump(poses, f, indent=2)
        
    return jsonify({'message': 'Yoga pose added successfully!', 'pose': new_pose}), 201


@app.route('/api/admin/poses/<string:pose_id>', methods=['DELETE'])
@token_required
def admin_delete_pose(current_user, pose_id):
    if current_user != "admin":
        return jsonify({'message': 'Unauthorized!'}), 403
        
    pose_db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pose_db.json')
    try:
        with open(pose_db_path, 'r', encoding='utf-8') as f:
            poses = json.load(f)
    except Exception:
        return jsonify({'message': 'Pose database not found!'}), 404
        
    filtered_poses = [p for p in poses if p.get('id') != pose_id]
    if len(filtered_poses) == len(poses):
        return jsonify({'message': 'Pose not found!'}), 404
        
    with open(pose_db_path, 'w', encoding='utf-8') as f:
        json.dump(filtered_poses, f, indent=2)
        
    return jsonify({'message': 'Yoga pose deleted successfully!'}), 200


if __name__ == '__main__':
    create_tables()
    app.run(debug=True, host="127.0.0.1", port=5000)