

---

```md
# 🏗️ 3D Modeler - Real-Time 3D Home Design Tool

This is a full-stack 3D home customization web app built with **React**, **Three.js**, and **Firebase** for real-time authentication and role-based access control.

> 🔐 Admins can manage users and approve access.
> 🧑‍🎨 Users can build 3D models after login and approval.

---

## 📦 Prerequisites

- Node.js (v18+ recommended)
- Firebase project setup
- Google, Facebook, and Yahoo Auth enabled in Firebase

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/3d-modeler.git
cd 3d-modeler
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the React App

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔥 Firebase Setup

Make sure your Firebase settings are correctly configured:

- `src/Backend/firebaseConfig.js` — contains your frontend Firebase config.
- `src/Backend/serviceAccountKey.json` — contains the private key for Firebase Admin SDK.
- `src/Backend/firebaseAdmin.js` — initializes admin access for user verification and role control.

---

## 🌐 Backend Server (Express API)

### Run Backend Server

```bash
node src/Backend/server.js
```

> ✅ Make sure `server.js` is correctly configured with routes in `/routes` and controllers in `/controllers`.

---

## 🔒 Authentication Flow

- **Sign Up:** via Google, Facebook, or Yahoo (email/password is disabled).
- **Admin Approval:** Admin must approve users before access.
- **Redirects:**
  - Approved users → `/` (3D Builder)
  - Admins → `/admin-landing` → manage dashboard or 3D Builder
  - Pending approval → `/pending-approval` (optional)

---

## 🧪 Available Scripts

```bash
npm start        # Start dev server
npm run build    # Build for production
npm run test     # Run tests
npm run eject    # Eject config (not recommended)
```

---

## ✨ Tech Stack

- React + React Router DOM
- Three.js + @react-three/fiber
- Firebase Auth & Firestore
- Express.js + Firebase Admin
- Tailwind CSS (optionally used)
- Zustand (state management)

---

## 🧠 Learn More

- [Create React App Docs](https://create-react-app.dev)
- [React Docs](https://reactjs.org/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Three.js Docs](https://threejs.org/docs/)

---

## 🛠️ Troubleshooting

- Ensure Firebase keys are correct.
- Enable CORS on backend if accessing from a different port.
- Use `localStorage` keys: `token`, `role`, `approved`, `email`.

---

## 📄 License

MIT License © 2025

---

```

Let me know if you'd like to add deployment instructions (like Firebase Hosting, Vercel, or Netlify) or a visual walkthrough section!
