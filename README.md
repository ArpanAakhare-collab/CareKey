# CareKey | SecureQR Health Platform

> **Production Healthcare Platform** | React 19 + Tailwind CSS + Firebase Auth + Cloud Firestore + Firebase Storage + Java Spring Boot + Google Gemini AI  
> Fully compliant with the **SecureQR Health Requirements** and zero synthetic mock datasets.

---

## 🌟 Architectural Overview

CareKey is an enterprise-grade healthcare management and privacy-preserving platform built with modern web technologies:

1. **Authentication First (`/login`)**:
   - The platform strictly enforces authentication before displaying any dashboard or patient records.
   - **Google Sign-In**: Integrated with `GoogleAuthProvider` for one-click access.
   - **Email / Password**: Full lifecycle supporting Sign In, Sign Up, and Password Reset recovery emails.
   - **Phone OTP**: International SMS verification with country code selector, invisible Recaptcha verification, and 6-digit code verification.

2. **Persistent & Responsive Navigation (`/home`)**:
   - Once authenticated, users are routed to `/home` with a persistent, collapsible sidebar and adaptive mobile drawer.
   - **Navigation Modules**:
     - **Home**: Welcome dashboard, quick health actions, live appointments & records overview.
     - **Find Care**: Search facility directories and specialized clinical services.
     - **Doctors**: Healthcare provider directory with specialty and hospital affiliation filters.
     - **Hospitals**: Verified medical centers and clinic directory.
     - **Appointments**: Real-time appointment management and scheduling modal integrated with Firestore.
     - **Medical Records**: Document and lab report manager backed by Firebase Storage.
     - **Prescriptions**: Active medication schedule and dosage tracking.
     - **AI Assistant**: Conversational health copilot powered by Google Gemini API via Spring Boot backend.
     - **Notifications**: System alerts and appointment updates.
     - **Profile**: Personal profile management and emergency contact information.
     - **Settings**: Security, notification preferences, and privacy controls.

3. **Zero Dummy / Mock Data Guarantee**:
   - The application starts with a pristine, empty dataset.
   - No hardcoded metric counters, fake patient rosters, or synthetic charts.
   - Every module features thoughtful, professional empty states when no records exist.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons |
| **Authentication** | Firebase Authentication (Google, Email/Password, Phone OTP) |
| **Database** | Cloud Firestore (`users`, `appointments`, `medical_records`, `prescriptions`, `notifications`, `doctors`, `hospitals`) |
| **Document Storage** | Firebase Storage (`medical_records/{uid}/{timestamp}_{filename}`) |
| **Backend** | Java 21, Spring Boot 3.4.x, Spring Security |
| **AI Intelligence** | Google Gemini API (Server-Side at `/api/ai/chat`) |
| **Security Rules** | Patient-isolated Firestore (`firestore.rules`) and Storage (`storage.rules`) |

---

## 🚀 Getting Started

### 1. Launch Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser. Unauthenticated visits automatically route to `/login`.

### 2. Launch Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
Backend runs on **`http://localhost:8080`**.

---

## 🔒 Security Rules & Data Privacy

### Firestore Security (`firestore.rules`)
- **User Profiles**: Isolated per user (`request.auth.uid == userId`).
- **Appointments**: Read/write restricted to the patient owner or assigned provider.
- **Medical Records**: Owner-only access (`resource.data.patientId == request.auth.uid`).
- **Directories**: Read-only access to doctor and hospital records for authenticated users.

### Firebase Storage Security (`storage.rules`)
- Restricts document upload and download strictly to the authenticated document owner (`request.auth.uid == userId`).

---

## 📁 Repository Structure

```
CareKey/
├── firestore.rules          # Production Firestore security rules
├── storage.rules            # Production Firebase Storage security rules
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppLayout.jsx        # Shell layout combining Sidebar, TopBar, and Content
│   │   │   ├── Sidebar.jsx          # Persistent responsive sidebar navigation
│   │   │   └── TopBar.jsx           # Top header with user profile menu and search
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Firebase auth provider (Google, Email, Phone OTP)
│   │   ├── firebase/
│   │   │   └── firebaseConfig.js    # Firebase SDK initialization
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Authentication page (Google, Email, Phone OTP)
│   │   │   ├── Home.jsx             # User home overview
│   │   │   ├── FindCare.jsx         # Care finder directory
│   │   │   ├── Doctors.jsx          # Doctor search and directory
│   │   │   ├── Hospitals.jsx        # Hospitals and clinics directory
│   │   │   ├── Appointments.jsx     # Appointments list & booking modal
│   │   │   ├── MedicalRecords.jsx   # Document manager with Storage file uploads
│   │   │   ├── Prescriptions.jsx    # Medication management
│   │   │   ├── AIAssistant.jsx      # Gemini AI health assistant
│   │   │   ├── Notifications.jsx    # Notifications list
│   │   │   ├── Profile.jsx          # User profile view/edit
│   │   │   └── Settings.jsx         # Account settings
│   │   ├── services/
│   │   │   ├── api.js               # HTTP client with Bearer auth token
│   │   │   ├── auth.js              # Firebase auth actions
│   │   │   ├── firestoreService.js  # Real Firestore CRUD operations
│   │   │   ├── storageService.js    # Firebase Storage upload operations
│   │   │   └── aiApi.js             # Spring Boot AI chat client
│   │   ├── App.jsx                  # Main application router
│   │   └── main.jsx                 # React root mount
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/main/java/com/carekey/
│   │   ├── controller/
│   │   │   ├── AIController.java    # AI chat endpoint (/api/ai/chat)
│   │   │   └── ...
│   │   ├── service/
│   │   │   ├── AIService.java       # Gemini API client
│   │   │   └── ...
│   └── pom.xml
│
└── README.md
```
