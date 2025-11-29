# Mini Task Management System

A full-stack Task Management System with AI-powered task classification. Built with Node.js, Next.js, and Python Flask, featuring a machine learning classifier that automatically predicts task priority and status.

## 🚀 Features

- **Task Management**: Create, read, update, and delete tasks
- **AI-Powered Classification**: Automatically predict task priority and status from descriptions
- **Kanban Board**: Visual task organization with Todo, Progress, and Done columns
- **Analytics Dashboard**: Real-time analytics with charts and filters
- **Modern UI/UX**: Beautiful gradient design with Tailwind CSS
- **Full-Stack Architecture**: Backend API, Frontend SPA, and ML Service
- **Comprehensive Testing**: Jest tests for backend and frontend

## 📁 Repository Structure

```
.
├── backend/          # Express + Mongoose REST API
├── frontend/         # Next.js + Tailwind + React Query
├── classifier/       # Flask service with sklearn model
└── README.md         # This file
```

## 🛠️ Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+ (3.11+ recommended for Windows)
- **MongoDB** (optional - system works with in-memory fallback)
- **Git**

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd SDE_Task
```

### 2. Setup Classifier Service

```bash
cd classifier
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
python train.py          # Train the ML model (optional)
python app.py            # Start classifier service
```

The classifier runs on `http://localhost:5000`

### 3. Setup Backend

```bash
cd backend
cp .env.example .env     # Copy and edit .env file
npm install
npm run dev              # Start backend server
```

The backend runs on `http://localhost:4000`

**Note:** If `MONGODB_URI` is not set, the backend uses an in-memory store (data lost on restart).

### 4. Setup Frontend

```bash
cd frontend
npm install
npm run dev              # Start frontend server
```

The frontend runs on `http://localhost:3000`

### 5. Access the Application

1. Open `http://localhost:3000` in your browser
2. Login with any email (e.g., `user@example.com`)
3. Start managing tasks!

## 🔧 Environment Variables

### Backend (`backend/.env`)

```env
MONGODB_URI=mongodb://localhost:27017/taskmanager
PORT=4000
CLASSIFIER_URL=http://localhost:5000/predict
ALLOWED_ORIGIN=http://localhost:3000
```

### Classifier (`classifier/.env` - optional)

```env
PORT=5000
FLASK_ENV=development
```

## 📡 API Endpoints

### Authentication
- `POST /auth/login` - Mock login (returns token and email)

### Tasks
- `GET /tasks` - List all tasks
- `POST /tasks` - Create a new task
- `GET /tasks/:id` - Get task by ID
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/classify` - Classify task description (AI)
- `GET /tasks/analytics` - Get analytics data

**All task endpoints require header:** `X-User-Email: user@example.com`

### Example API Calls

```bash
# Create a task
curl -X POST http://localhost:4000/tasks \
  -H "Content-Type: application/json" \
  -H "X-User-Email: user@example.com" \
  -d '{
    "title": "Fix critical bug",
    "description": "Server is down, urgent fix needed",
    "priority": "high",
    "status": "progress"
  }'

# Classify a task description
curl -X POST http://localhost:4000/tasks/classify \
  -H "Content-Type: application/json" \
  -H "X-User-Email: user@example.com" \
  -d '{"description": "Server is down, urgent fix needed"}'

# Get analytics
curl -X GET http://localhost:4000/tasks/analytics \
  -H "X-User-Email: user@example.com"
```

## 🤖 AI Classifier

The system includes an AI-powered classifier that automatically predicts:
- **Priority**: High, Medium, or Low
- **Status**: Todo, Progress, or Done

### How It Works

1. **ML Model**: Trained on 100+ examples using scikit-learn
   - TF-IDF vectorization
   - Logistic Regression classifier
   - Accuracy: ~85-90%

2. **Heuristic Fallback**: Keyword-based classification
   - Used when ML model is unavailable
   - Weighted keyword matching
   - Confidence scoring

3. **Automatic Fallback**: System automatically switches between model and heuristics

### Training the Model

```bash
cd classifier
python train.py
```

This creates `model/classifier.pkl` with the trained model.

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

Tests cover:
- Task CRUD operations
- Classification endpoint
- Analytics endpoint
- Authentication middleware

### Frontend Tests

```bash
cd frontend
npm test
```

Tests cover:
- Dashboard greeting
- Time-based greetings
- Username extraction
- Component rendering

## 🏗️ Architecture

### Backend
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose (in-memory fallback)
- **Validation**: Joi
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: Next.js 13
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Charts**: Recharts
- **Testing**: Jest + React Testing Library

### Classifier
- **Framework**: Flask
- **ML Library**: scikit-learn
- **Model**: Logistic Regression with TF-IDF
- **Fallback**: Keyword-based heuristics

## 📦 Running All Services

Open three terminal windows:

**Terminal 1 - Classifier:**
```bash
cd classifier
python app.py
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open `http://localhost:3000` in your browser.

## 🔐 Authentication

The system uses mock email-based authentication:
- Any email works for login
- Token stored in localStorage
- Email sent as `X-User-Email` header in API requests

## 📊 Features Overview

### Dashboard
- Personalized greeting based on time of day
- Kanban board with 3 columns (Todo, Progress, Done)
- Color-coded priority borders
- Real-time task updates
- Drag-and-drop ready (UI prepared)

### Task Management
- Create tasks with title, description, priority, and status
- Edit tasks inline
- Delete tasks with confirmation
- AI-powered auto-classification

### Analytics
- Summary cards (Total Tasks, High Priority, etc.)
- Priority distribution pie chart
- Status distribution pie chart
- Tasks over time chart
- Dynamic filters (date range, priority, status)

## 🐛 Troubleshooting

### Classifier Not Working
- Ensure classifier service is running on port 5000
- System will use heuristic fallback (still works!)
- Check `CLASSIFIER_URL` in backend `.env`

### MongoDB Connection Issues
- Leave `MONGODB_URI` unset to use in-memory store
- Or ensure MongoDB is running and accessible
- Check connection string format

### Frontend Not Loading
- Ensure backend is running on port 4000
- Check browser console for errors
- Verify `NEXT_PUBLIC_API_URL` if set

### Port Already in Use
- Change ports in respective `.env` files
- Or kill existing processes using those ports

## 📝 Development Notes

### In-Memory Store
If `MONGODB_URI` is not set, the backend uses an in-memory store:
- Data persists only during server runtime
- Lost on server restart
- Perfect for development and testing

### Model Training
The classifier model is optional:
- System works with heuristics alone
- Model improves accuracy
- Train with `python train.py` in classifier directory

## 🚀 Deployment

### Backend
- Set production environment variables
- Use process manager (PM2, systemd)
- Configure MongoDB connection
- Enable CORS for frontend domain

### Frontend
- Build: `npm run build`
- Start: `npm start`
- Or deploy to Vercel/Netlify

### Classifier
- Use production WSGI server (Gunicorn)
- Set production Flask environment
- Ensure model file is included

## 📄 License

This project is part of an assignment/evaluation.

## 👤 Author

Built as part of SDE Task evaluation.

---

