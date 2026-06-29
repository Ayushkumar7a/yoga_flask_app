import os
import sqlite3
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "users.db")

def create_tables():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # USERS TABLE (expanded)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            age INTEGER,
            height REAL,
            weight REAL,
            fitness_level TEXT,
            goal TEXT
        )
    """)

    # Migrate users table if profile columns are missing
    cursor.execute("PRAGMA table_info(users)")
    columns = [col[1] for col in cursor.fetchall()]
    needed_columns = {
        "age": "INTEGER",
        "height": "REAL",
        "weight": "REAL",
        "fitness_level": "TEXT",
        "goal": "TEXT"
    }
    for col_name, col_type in needed_columns.items():
        if col_name not in columns:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")

    # YOGA LOGS TABLE (expanded)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS yoga_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            pose_name TEXT,
            reps INTEGER,
            duration_seconds INTEGER,
            accuracy INTEGER,
            timestamp TEXT
        )
    """)

    # Migrate yoga_logs table if columns are missing
    cursor.execute("PRAGMA table_info(yoga_logs)")
    log_columns = [col[1] for col in cursor.fetchall()]
    needed_log_cols = {
        "pose_name": "TEXT",
        "duration_seconds": "INTEGER",
        "accuracy": "INTEGER"
    }
    for col_name, col_type in needed_log_cols.items():
        if col_name not in log_columns:
            cursor.execute(f"ALTER TABLE yoga_logs ADD COLUMN {col_name} {col_type}")
            
    if "pose_name" not in log_columns and "workout_type" in log_columns:
        cursor.execute("UPDATE yoga_logs SET pose_name = workout_type WHERE pose_name IS NULL")

    # ACHIEVEMENTS TABLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            badge_name TEXT,
            unlocked_at TEXT,
            UNIQUE(username, badge_name)
        )
    """)

    # FEEDBACK TABLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            email TEXT,
            message TEXT,
            rating INTEGER,
            timestamp TEXT
        )
    """)

    # TUTORIALS TABLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tutorials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            url TEXT,
            duration TEXT,
            difficulty TEXT,
            created_at TEXT
        )
    """)

    # Seed default admin user if not exists
    cursor.execute("SELECT COUNT(*) FROM users WHERE username='admin'")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO users (username, password, age, height, weight, fitness_level, goal)
            VALUES ('admin', 'admin123', 30, 175, 70, 'Advanced', 'Flexibility')
        """)

    # Seed default tutorials if table is empty
    cursor.execute("SELECT COUNT(*) FROM tutorials")
    if cursor.fetchone()[0] == 0:
        default_tutorials = [
            ("Warrior II Pose Guide", "Learn the correct arm alignment, hip opening, and knee positioning for a strong Warrior II stance.", "https://www.youtube.com/watch?v=k-3v3R3WjEw", "6 mins", "Beginner"),
            ("Tree Pose for Balance", "Master your focus and leg stability with this complete walkthrough of Tree Pose (Vrksasana).", "https://www.youtube.com/watch?v=yW6a5G-L2-c", "5 mins", "Beginner"),
            ("Perfect Plank Alignment", "Build core strength safely. Learn how to align your head, shoulders, hips, and knees in Plank Pose.", "https://www.youtube.com/watch?v=k1t6t810H5w", "7 mins", "Intermediate"),
            ("Chair Pose Breakdown", "Strengthen your thighs and core. Discover how to enter, hold, and exit Chair Pose (Utkatasana) safely.", "https://www.youtube.com/watch?v=kS_b8qJ21Y4", "6 mins", "Beginner"),
            ("Goddess Pose Tutorial", "Open your hips and groin. Learn the wide-stance squat with cactus arm positioning for Goddess Pose.", "https://www.youtube.com/watch?v=J3Y6lP6c-48", "4 mins", "Intermediate")
        ]
        created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        for title, desc, url, duration, diff in default_tutorials:
            cursor.execute("""
                INSERT INTO tutorials (title, description, url, duration, difficulty, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (title, desc, url, duration, diff, created_at))

    conn.commit()
    conn.close()


def add_user(username, password, age=None, height=None, weight=None, fitness_level="Beginner", goal="Flexibility"):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO users (username, password, age, height, weight, fitness_level, goal)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (username, password, age, height, weight, fitness_level, goal))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print("Signup error:", e)
        conn.close()
        return False


def verify_user(username, password):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username=? AND password=?", (username, password))
    user = cursor.fetchone()
    conn.close()
    return user is not None


def update_profile(username, age, height, weight, fitness_level, goal):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE users
        SET age=?, height=?, weight=?, fitness_level=?, goal=?
        WHERE username=?
    """, (age, height, weight, fitness_level, goal, username))
    conn.commit()
    conn.close()


def get_user_profile(username):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT username, age, height, weight, fitness_level, goal FROM users WHERE username=?", (username,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return None


def save_yoga_log(username, pose_name, reps, duration_seconds, accuracy):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO yoga_logs (username, pose_name, reps, duration_seconds, accuracy, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (username, pose_name, reps, int(duration_seconds), int(accuracy), timestamp))
    conn.commit()
    conn.close()
    
    # After saving log, trigger achievement validation
    check_and_unlock_achievements(username)


def get_logs(username):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM yoga_logs WHERE username=? ORDER BY timestamp DESC", (username,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_achievements(username):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT badge_name, unlocked_at FROM achievements WHERE username=?", (username,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def check_and_unlock_achievements(username):
    logs = get_logs(username)
    if not logs:
        return
        
    total_sessions = len(logs)
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    unlocked = []
    
    def unlock(badge):
        try:
            cursor.execute("""
                INSERT OR IGNORE INTO achievements (username, badge_name, unlocked_at)
                VALUES (?, ?, ?)
            """, (username, badge, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
            unlocked.append(badge)
        except Exception as e:
            print("Error unlocking badge:", e)

    # Rule 1: Beginner Badge (First Session)
    if total_sessions >= 1:
        unlock("Beginner Badge")
        
    # Rule 2: Intermediate Badge (10 Sessions)
    if total_sessions >= 10:
        unlock("Intermediate Badge")
        
    # Rule 3: Advanced Badge (50 Sessions)
    if total_sessions >= 50:
        unlock("Advanced Badge")

    # Rule 4: Century Club Badge (100 Sessions)
    if total_sessions >= 100:
        unlock("100 Sessions Badge")

    # Rule 5: Streak badge (calculate current streak)
    streak = calculate_streak(logs)
    if streak >= 3:
        unlock("3-Day Burn")
    if streak >= 7:
        unlock("Weekly Warrior")
        
    conn.commit()
    conn.close()


def calculate_streak(logs):
    if not logs:
        return 0
    # Group logs by date (YYYY-MM-DD)
    dates = sorted(list(set(datetime.strptime(log['timestamp'], "%Y-%m-%d %H:%M:%S").date() for log in logs)), reverse=True)
    
    streak = 0
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    
    # Check if they practiced today or yesterday to start the streak count
    if dates[0] == today:
        streak = 1
        current_expected = today - timedelta(days=1)
    elif dates[0] == yesterday:
        streak = 1
        current_expected = yesterday - timedelta(days=1)
    else:
        return 0
        
    for d in dates[1:]:
        if d == current_expected:
            streak += 1
            current_expected -= timedelta(days=1)
        elif d > current_expected:
            # multiple sessions on same day already excluded by set
            continue
        else:
            break
            
    return streak


def get_dashboard_stats(username):
    logs = get_logs(username)
    total_sessions = len(logs)
    
    if total_sessions == 0:
        return {
            "totalSessions": 0,
            "todayPractice": 0,
            "weeklyProgress": [0] * 7,
            "accuracy": 0,
            "calories": 0,
            "streak": 0,
            "totalTime": 0
        }
        
    # Today's practice duration in minutes
    today_str = datetime.now().strftime("%Y-%m-%d")
    today_time = sum(log['duration_seconds'] for log in logs if log['timestamp'].startswith(today_str)) // 60
    
    # Total time in seconds
    total_time = sum(log['duration_seconds'] for log in logs)
    
    # Accuracy percentage (average)
    avg_accuracy = int(sum(log['accuracy'] for log in logs) / total_sessions)
    
    # Calories: rough estimate (approx 6 calories per minute of yoga)
    total_calories = int((total_time / 60.0) * 6)
    
    # Streak
    streak = calculate_streak(logs)
    
    # Weekly progress (past 7 days, Monday to Sunday or last 7 days)
    # Let's count sessions per day for the last 7 days
    weekly_progress = []
    for i in range(6, -1, -1):
        day = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
        day_sessions = sum(1 for log in logs if log['timestamp'].startswith(day))
        weekly_progress.append(day_sessions)
        
    return {
        "totalSessions": total_sessions,
        "todayPractice": today_time,
        "weeklyProgress": weekly_progress,
        "accuracy": avg_accuracy,
        "calories": total_calories,
        "streak": streak,
        "totalTime": total_time
    }


def save_feedback(username, email, message, rating):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO feedback (username, email, message, rating, timestamp)
        VALUES (?, ?, ?, ?, ?)
    """, (username, email, message, int(rating) if rating else 5, timestamp))
    conn.commit()
    conn.close()


def get_feedbacks():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM feedback ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def delete_feedback(feedback_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM feedback WHERE id=?", (feedback_id,))
    conn.commit()
    conn.close()


def get_tutorials():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tutorials ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def add_tutorial(title, description, url, duration, difficulty):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    created_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO tutorials (title, description, url, duration, difficulty, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (title, description, url, duration, difficulty, created_at))
    conn.commit()
    conn.close()


def delete_tutorial(tutorial_id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tutorials WHERE id=?", (tutorial_id,))
    conn.commit()
    conn.close()