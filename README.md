# College Search Application

A modern React Native mobile application for searching and comparing colleges, built with Expo and TypeScript.

## 🚀 Features

- Browse and search for colleges
- View college details and statistics
- Compare multiple colleges side by side
- Save favorite colleges
- User authentication
- Modern UI with smooth animations

## 🛠️ Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Python 3.8+ (for backend)
- Xcode (for iOS development, Mac only)
- Android Studio (for Android development)

## 🏗️ Project Structure

```
.
├── frontend/           # React Native Expo app
├── backend/            # Python FastAPI backend
└── README.md           # This file
```

## 🚀 Getting Started

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the frontend directory with the following variables:
   ```env
   EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

4. Start the development server:
   ```bash
   npx expo start
   ```

5. Run on a specific platform:
   - **iOS Simulator**: Press `i` in the terminal after starting the server
   - **Android Emulator**: Press `a` in the terminal after starting the server
   - **Physical Device**: Scan the QR code with the Expo Go app (iOS) or Camera app (Android)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables in `.env`:
   ```env
   DATABASE_URL=sqlite:///./college.db
   SECRET_KEY=your-secret-key
   ```

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the backend server:
   ```bash
   uvicorn server:app --reload
   ```
   The API will be available at `http://localhost:8000`

## 🧪 Running Tests

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
pytest
```

## 🔧 Troubleshooting

- **Port already in use**: If you get a port conflict, you can change the port:
  ```bash
  npx expo start --port 19000
  ```
  or for the backend:
  ```bash
  uvicorn server:app --reload --port 8001
  ```

- **iOS build issues**: Make sure you have Xcode and Xcode Command Line Tools installed.

- **Android build issues**: Ensure Android Studio and Android SDK are properly configured.

## 📚 Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



Frontend 
cd frontend
npm install
npx expo start


Backend

cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload