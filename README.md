# 🏢 RentFlow – A Comprehensive Rental Property Management System

RentFlow is a full-stack MERN application built to streamline and automate rental property operations for landlords and tenants. The system allows for the management of tenants, leases, maintenance requests, and billing—all with secure Google-based authentication and role-based access.

---

## 🚀 Live URL

- 🌐 **API (Backend)**: [https://sia-project-fg0k.onrender.com](https://sia-project-fg0k.onrender.com)



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
  - Tenant Management
  - Lease and Unit Tracking
  - Maintenance Request Logging
  - Billing System

- 🧍‍♂️ **Tenant Portal**
  - View Lease Info
  - Submit Maintenance Requests
  - View Bills & Payment Status

- 🛡 **Authentication & Authorization**
  - Google Login
  - Role-Based Access Control (Admin & Tenant)
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

cd frontend
npm install

cd backend
npm install

## 📦 Configure Environment Variables

*Example of env*
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
