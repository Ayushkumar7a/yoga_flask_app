# FlexFlow AI — Premium Yoga Pose Detection

FlexFlow AI is an interactive, full-stack web application designed to help practitioners master their posture and alignment in real-time. Combining browser-based computer vision (MediaPipe) with a comprehensive analytics dashboard, gamified achievements, and ambient meditation spaces, it serves as a personalized virtual yoga coach.

**Live Application URL**: [https://Ayushkumar7a.github.io/yoga_flask_app/](https://Ayushkumar7a.github.io/yoga_flask_app/)

---

## 🚀 Key Features

*   **Real-time AI Pose Coaching**: Analyzes skeletal joint landmarks at 60fps locally in the browser to validate alignment and posture.
*   **Analytics Dashboard**: Displays weekly practice volume, average accuracy scores, daily calorie burn, and active minutes using interactive charts.
*   **Asana Pose Library**: Houses over 30 detailed yoga poses with step-by-step instructions, alignment checks, common mistakes, and precautions.
*   **Gamified Achievements**: Unlock Beginner, Intermediate, Advanced, and streak badges (e.g., "3-Day Burn") as you log workouts.
*   **Meditation & Breathing Room**: Breathe alongside a guided visualizer and unwind with custom nature/cosmic ambient soundscapes and meditation timers.
*   **BMI & Pose Planner**: Computes Body Mass Index and suggests specific yoga sequences tailored to your weight category.
*   **System Administration Panel**: Access a dedicated control panel (authenticated admin profile) to manage system-wide metrics, upload/delete poses and video lessons, and oversee user records.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: React.js (built with Vite)
*   **Styling**: Tailwind CSS v4 (responsive utility classes & custom glassmorphism components)
*   **Icons**: Lucide React
*   **Charts**: Chart.js & React-Chartjs-2
*   **Computer Vision**: MediaPipe Pose Detection

### Backend
*   **Framework**: Flask (Python)
*   **Authentication**: JSON Web Token (JWT)
*   **Database**: SQLite
*   **Reports**: PDF Summary generation using ReportLab

---

## 💻 Local Installation & Setup

### Prerequisites
*   Python 3.10+
*   Node.js (v18+) & npm

### 1. Backend Setup (Flask)
Navigate to the `backend/` directory:
```bash
cd backend
```

Activate the virtual environment:
```bash
# On macOS/Linux:
source ../venv/bin/activate
# On Windows:
..\venv\Scripts\activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Run the server:
```bash
python app.py
```
The backend API will run on `http://127.0.0.1:5000`.

### 2. Frontend Setup (React)
Navigate to the `frontend/` directory in a new terminal window:
```bash
cd frontend
```

Install packages:
```bash
npm install
```

Run the development server:
```bash
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser to view the application.

---

## 🔑 Administrative Access
To log into the administrator dashboard and manage portal assets:
*   **Username**: `admin`
*   **Password**: `admin123`

---

## 📦 Deployment

### Host Frontend on GitHub Pages
This project includes a dedicated shell script to compile the frontend and deploy the static build:
```bash
./frontend/deploy.sh
```
This builds the production package and pushes it to the `gh-pages` branch on GitHub.
