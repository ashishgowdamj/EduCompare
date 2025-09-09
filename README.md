# College Search Application

A modern React Native mobile application for searching and comparing colleges, built with Expo (TypeScript) and a FastAPI + MongoDB backend.

## 🚀 Features

- Browse and search for colleges with advanced filters
- Rich college profiles (Overview, Courses/Fees, Placements, Facilities, Reviews, Gallery, Contact)
- Compare colleges side-by-side
- Favorites, browsing history, and basic notifications
- Cutoffs + Seats support in backend, CSV export endpoint
- Lead/Enquiry form with optional webhook

## 🛠️ Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Python 3.10+
- MongoDB (local or cloud URI)
- Xcode (for iOS, macOS only) and/or Android Studio

## 🏗️ Project Structure

```
.
├── frontend/           # React Native Expo app
├── backend/            # FastAPI app (MongoDB)
└── README.md
```

## 🚀 Getting Started

### Frontend Setup

1) Install deps
```bash
cd frontend
npm install
```

2) Configure env (see `frontend/.env.example`)
```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
```

3) Start Expo
```bash
npx expo start
```

Tips
- iOS Simulator: press `i`
- Android Emulator: press `a`
- Use a Development Build for full notifications support (Expo Go limits remote push on SDK 53).

### Backend Setup (FastAPI + MongoDB)

1) Create venv and install deps
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: .\\venv\\Scripts\\activate
pip install -r requirements.txt
```

2) Configure env (see `backend/.env.example`)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=educompare
# Optional: forward leads to your CRM webhook
# LEAD_WEBHOOK_URL=https://your-crm.example.com/webhook
```

3) Run API
```bash
uvicorn server:app --reload
```
API: http://localhost:8000

### CSV Export (Cutoffs)
- Endpoint: `GET /api/cutoffs/export` with same filters as list API (e.g., `college_id`, `year`, `exam`, `category`, `branch`, `round`).
- Frontend adds an “Export CSV” button on the college Cutoffs tab that opens the CSV.

## 🧪 Running Tests

Frontend
```bash
cd frontend && npm test
```

Backend
```bash
cd backend && pytest
```

## 🔧 Troubleshooting

- Change Expo port: `npx expo start --port 19000`
- Change backend port: `uvicorn server:app --reload --port 8001`
- Expo Go push notifications warning: use a development build or skip token registration; the app auto-skips if no EAS projectId is present.

## 📚 Documentation
- Expo: https://docs.expo.dev
- FastAPI: https://fastapi.tiangolo.com

## 🤝 Contributing
1. Fork the repo
2. Create a branch (`git checkout -b feat/xyz`)
3. Commit (`git commit -m "feat: ..."`)
4. Push and open a PR

## 📄 License
MIT — see [LICENSE](LICENSE)
