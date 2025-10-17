# EduCompare – Engineering Docs

## Stack Overview
- **Frontend**: Expo + React Native + TypeScript, `expo-router`
- **Backend**: FastAPI (Uvicorn), Pydantic v2
- **Database**: MongoDB (Motor/PyMongo), Atlas in production
- **Build/CI**: EAS Build (APK), env via `.env` and `eas.json`

## Versions (current)
- Expo SDK: 54 (project uses expo@54.0.x)
- React Native: 0.81.x
- React: 19.x
- Reanimated: 4.1.x
- FastAPI: 0.110.x
- Uvicorn: 0.25.x
- Motor: 3.3.x, PyMongo: 4.5.x

## Repo Structure
```
/Users/learn/app
├── backend/                 # FastAPI app
│   ├── server.py            # Uvicorn entry (app)
│   ├── requirements.txt     # backend deps
│   └── ...
├── frontend/                # Expo app
│   ├── app/                 # expo-router routes
│   ├── components/          # shared components
│   ├── contexts/            # React contexts
│   ├── utils/api.ts         # base URL resolver
│   ├── app.json             # Expo config
│   ├── eas.json             # EAS build profiles
│   └── .env                 # EXPO_PUBLIC_BACKEND_URL
└── DOCS.md                  # this file
```

## Local Development
- **Backend**
```bash
# CWD: backend/
../.venv/bin/pip install -r requirements.txt
../.venv/bin/python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```
- **Frontend (Expo)**
```bash
# CWD: frontend/
npm install
npm run start         # or: npm run start -- -c  (clear cache)
```
- **ENV**
`frontend/.env`:
```
EXPO_PUBLIC_BACKEND_URL=http://<LAN_IP>:8000
```
The `API.baseUrl` is resolved in `frontend/utils/api.ts`.

## APK Build (Internal/Preview)
- **Config**: `frontend/eas.json` (preview profile)
- **Build**
```bash
# CWD: frontend/
eas login
npm install
# ensure expo-build-properties is installed if using HTTP
npm i expo-build-properties
# build APK
eas build -p android --profile preview
```
- Install APK from the EAS link on an Android device.

## Production-Ready Backend (Public HTTPS)
1) **MongoDB Atlas**
   - Create free cluster, DB user, get connection string (`mongodb+srv://...`).
2) **Deploy FastAPI (Render free)**
   - Root: `backend/`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn server:app --host 0.0.0.0 --port 10000`
   - Env vars: `MONGO_URL`, `DB_NAME`
3) **Verify**
   - `https://<render-app>.onrender.com/api/colleges/search?page=1&limit=5`
4) **Point App to HTTPS**
   - `frontend/.env` and `eas.json` → `EXPO_PUBLIC_BACKEND_URL=https://<render-app>.onrender.com`
   - Rebuild APK via EAS.

## Android Networking Notes
- Release builds block HTTP by default. If using LAN `http://192.168.x.x`, enable cleartext:
  - `frontend/app.json` plugin:
```
"plugins": [
  ["expo-build-properties", { "android": { "usesCleartextTraffic": true } }]
]
```
- Prefer HTTPS (public backend) to avoid cleartext entirely.

## Troubleshooting
- **Expo QR requires same Wi‑Fi** (LAN). Use `npx expo start --tunnel` to bypass.
- **Network request failed (device)**: ensure backend reachable from phone (LAN IP or HTTPS), correct `EXPO_PUBLIC_BACKEND_URL`, and that APK was rebuilt after changes.
- **Port 8000 busy**: free it or use 8001 and update env.
- **Missing assets**: `frontend/app.json` paths → `frontend/assets/images/*`. Restart Metro with `-c`.
- **Expo SDK patch warnings**: update to suggested patch versions after confirming stability.

## Useful Commands
```bash
# Backend
../.venv/bin/python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000

# Frontend dev
npm run start -- -c

# EAS
eas build -p android --profile preview
EAS_NO_VCS=1 eas build:list

# Verify backend from phone
http://<LAN_IP>:8000/api/colleges/search?page=1&limit=5
```

## Canonical Docs Links
- Expo: https://docs.expo.dev
- Expo Router: https://docs.expo.dev/router/introduction
- EAS Build: https://docs.expo.dev/build/introduction
- React Native: https://reactnative.dev/docs
- Reanimated: https://docs.swmansion.com/react-native-reanimated
- Moti: https://moti.fyi
- Tamagui: https://tamagui.dev/docs/intro/introduction
- FastAPI: https://fastapi.tiangolo.com
- Uvicorn: https://www.uvicorn.org
- Pydantic v2: https://docs.pydantic.dev
- Motor: https://motor.readthedocs.io
- MongoDB Atlas: https://www.mongodb.com/docs/atlas
- Render: https://render.com/docs

---
This document will be maintained alongside changes (SDK updates, build profiles, deploy steps).
