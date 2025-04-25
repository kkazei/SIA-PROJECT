# 🏢 RentFlow – A Comprehensive Rental Property Management System

RentFlow is a full-stack MERN application built to streamline and automate rental property operations for landlords and tenants. The system allows for the management of tenants, leases, maintenance requests, and billing—all with secure Google-based authentication and role-based access.

---

## 🚀 Live URL

- 🌐 **API (Backend)**: [https://sia-project-1.onrender.com/](https://sia-project-1.onrender.com/)

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: Google OAuth 2.0 with JWT
- **Deployment**: Render

---

## 🔐 Features

- 🧑‍💼 **Admin Portal**
  - System Statistics Dashboard
  - User Management (Create, View, Edit, Delete)
  - Manual User Verification
  - Password Reset Capabilities
  - Cross-Property Oversight
  - Global Announcement Management
  - Financial Operations Overview
  - System Configuration & Settings

- 🧑‍💼 **Landlord Portal**
  - Apartment Listing
  - Tenant Management
  - Lease and Unit Tracking
  - Maintenance Request Logging
  - Billing System

- 🧍‍♂️ **Tenant Portal**
  - Browse Available Apartments (New Tenants)
  - View Lease Info
  - View Announcements
  - Submit Maintenance Requests
  - View Bills & Payment Status

- 🛡 **Authentication & Authorization**
  - Google Login
  - Role-Based Access Control (Admin, Landlord & Tenant)
  - JWT-Protected Routes

- 📊 **Modular API**
  - RESTful architecture
  - Secure route handling
  - Input validation & error responses

---

## 🛠️ Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/kkazei/SIA-PROJECT.git
cd SIA-PROJECT
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=google_secret
EMAIL_USER=google_account
EMAIL_APP_PASSWORD=application_pass
```

---

## 🚀 Deployment Guide
#### Backend/Frontend Deployment

1. **Connect GitHub Repository**
   - Log in to [Render](https://render.com/)
   - Click on "New" and select "Web Service"
   - Connect your GitHub account and select the `SIA-PROJECT` repository

2. **Configure the Service**
   - **Name**: Choose a name for your service (e.g., "SIA-PROJECT")
   - **Branch**: Select your main branch (e.g., `main` or `master`)
   - **Root Directory**: If your backend is in a subdirectory, specify it (e.g., `backend`)
   - **Environment**: Select `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` or `node server.js` (depending on your start script)

3. **Environment Variables**
   - Scroll down to the "Advanced" section
   - Add all your environment variables:
     - `PORT`: 10000 (Render will override this with their own port)
     - `MONGO_URI`: your MongoDB connection string
     - `JWT_SECRET`: your JWT secret key
     - `GOOGLE_CLIENT_ID`: your Google Client ID
     - `GOOGLE_CLIENT_SECRET`: your Google Client Secret

4. **Deploy**
   - Click "Create Web Service"
   - Wait for the build and deployment process to complete



### Important Notes

- Make sure your backend's CORS settings allow requests from your frontend's domain
- Update any hardcoded URLs in your frontend code to use environment variables
- If your app uses WebSockets or needs persistent connections, check Render's documentation for specific settings

---

## 👨‍💻 Contributors

- (https://github.com/kkazei)
- (https://github.com/PickleC137)
- (https://github.com/VLADIMIRPUTTIN)
- (https://github.com/aldrin2002)