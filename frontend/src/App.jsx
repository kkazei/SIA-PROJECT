import { Navigate, Route, Routes, Link, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import LoadingSpinner from "./components/LoadingSpinner";
import FloatingShape from "./components/FloatingShape";
import DashboardPage from "./pages/DashboardPage";
import TenantSignUpPage from "./pages/TenantSignUp";
import TenantPage from "./pages/TenantPage";
import TenantLoginPage from "./pages/TenantLoginPage";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect, useState } from "react";
import Anouncement from "./pages/Announcement";
import MaintenancePage from "./pages/MaintenancePage";
import ArchivePage from "./pages/ArchivePage";
import TenantDashboard from "./pages/TenantDashboard";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, userRole } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && location.pathname === "/tenant-dashboard" && userRole !== "tenant") {
    return <Navigate to="/" replace />;
  }

  return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const SideNavbar = ({ isMaximized, setIsMaximized }) => {
  const { logout } = useAuthStore();
  const location = useLocation(); // Get current URL path

  return (
    <div
      className={`fixed left-0 top-0 h-full ${
        isMaximized ? "w-64" : "w-16"
      } bg-gray-800 text-white p-4 transition-all duration-300`} // Added duration-300 for smooth transition
      onMouseEnter={() => setIsMaximized(true)}
      onMouseLeave={() => setIsMaximized(false)}
    >
      <div className="flex items-center mb-6">
      <img src="/image/Menu.png" alt="Menu Icon" className="w-8 h-8" />
        {isMaximized && <h2 className="text-3xl font-bold ml-2">RentFlow</h2>}
      </div>

      <nav>
        <ul className="space-y-4 mt-20">
          {" "}
          {/* Increased margin-top */}
          <li>
            <Link
              to="/"
              className={`flex items-center pl-1 py-2 gap-3 rounded-lg ${
                location.pathname === "/" ? "bg-gray-700" : "hover:bg-black"
              }`}
            >
              <img src="/image/dashboard.png" alt="Dashboard" className="w-6 h-6" />
              {isMaximized && "Dashboard"}
            </Link>
          </li>
          <li>
            <Link
              to="/announcement"
              className={`flex items-center pl-1 py-2 gap-3 rounded-lg ${
                location.pathname === "/announcement"
                  ? "bg-gray-700"
                  : "hover:bg-black"
              }`}
            >
              <img
                src="/image/announcement.png"
                alt="Announcements"
                className="w-6 h-6"
              />
              {isMaximized && "Announcements"}
            </Link>
          </li>
          <li>
            <Link
              to="/tenant-page"
              className={`flex items-center pl-1 py-2 gap-3 rounded-lg ${
                location.pathname === "/tenant-page"
                  ? "bg-gray-700"
                  : "hover:bg-black"
              }`}
            >
              <img src="/image/person.png" alt="Tenant" className="w-6 h-6" />
              {isMaximized && "Tenant"}
            </Link>
          </li>
          <li>
            <Link
              to="/maintenance-page"
              className={`flex items-center pl-1 py-2 gap-3 rounded-lg ${
                location.pathname === "/maintenance-page"
                  ? "bg-gray-700"
                  : "hover:bg-black"
              }`}
            >
              <img
                src="/image/maintenance.png"
                alt="Maintenance"
                className="w-6 h-6"
              />
              {isMaximized && "Maintenance"}
            </Link>
          </li>
          <li>
            <Link
              to="/archive-page"
              className={`flex items-center pl-1 py-2 gap-3 rounded-lg ${
                location.pathname === "/archive-page"
                  ? "bg-gray-700"
                  : "hover:bg-black"
              }`}
            >
              <img src="/image/archive.png" alt="Archive" className="w-6 h-6" />
              {isMaximized && "Archive"}
            </Link>
          </li>
          {/* Logout Button - Slightly Lower */}
          <li className="mt-10">
            <button
              onClick={logout}
              className="w-fit text-left hover:bg-black absolute bottom-4 text-white p-3 rounded-lg flex items-center"
            >
              <img src="/image/logout.png" alt="Logout" className="w-5 h-6 mr-2" />
              {isMaximized && "Logout"}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

function App() {
  const { isCheckingAuth, checkAuth, isAuthenticated } = useAuthStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const location = useLocation(); // Get current URL path

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex relative overflow-hidden">
      {isAuthenticated && location.pathname !== "/tenant-dashboard" && (
        <SideNavbar
          isMaximized={isMaximized}
          setIsMaximized={setIsMaximized}
        />
      )}
      <div
        className={`flex-grow flex items-center justify-center transition-all duration-300 ${
          isAuthenticated ? (isMaximized ? "ml-64" : "ml-16") : "ml-0"
        }`} // Added duration-300 for smooth transition
      >
        <FloatingShape
          color="bg-green-500"
          size="w-64 h-64"
          top="-5%"
          left="10%"
          delay={0}
        />
        <FloatingShape
          color="bg-emerald-500"
          size="w-48 h-48"
          top="70%"
          left="80%"
          delay={5}
        />
        <FloatingShape
          color="bg-lime-500"
          size="w-32 h-32"
          top="40%"
          left="-10%"
          delay={2}
        />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectAuthenticatedUser>
                <SignUpPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/tenant-signup"
            element={
              <RedirectAuthenticatedUser>
                <TenantSignUpPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/login"
            element={
              <RedirectAuthenticatedUser>
                <LoginPage />
              </RedirectAuthenticatedUser>
            }
          />
          <Route
            path="/announcement"
            element={
              <ProtectedRoute>
                <Anouncement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant-page"
            element={
              <ProtectedRoute>
                <TenantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance-page"
            element={
              <ProtectedRoute>
                <MaintenancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/archive-page"
            element={
              <ProtectedRoute>
                <ArchivePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant-login"
            element={
              <RedirectAuthenticatedUser>
                <TenantLoginPage />
              </RedirectAuthenticatedUser>
            }
            />
            <Route
            path="/tenant-dashboard"
            element={
              <ProtectedRoute>
                <TenantDashboard />
              </ProtectedRoute>
            }
          />


          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toaster />
    </div>
  );
}

export default App;

