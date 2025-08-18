// src/components/Header.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css"; // we'll add this next
import ProfSettingModal from "../pages/ProfSettingModal";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

interface HeaderProps {
  showProfSettingModal: boolean;
  setShowProfSettingModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const storedUser = sessionStorage.getItem("loggedInUser");
const userData = storedUser ? JSON.parse(storedUser) : null;

// Extract initials from email first 2 letter before @ or use a default value "??"
const initials = userData?.email
  ? userData.email.split("@")[0].slice(0, 2).toUpperCase()
  : "??";

const Header: React.FC<HeaderProps> = ({
  showProfSettingModal,
  setShowProfSettingModal,
}) => {
  const navigate = useNavigate();

  const location = useLocation();
  const currentPath = location.pathname;

  const isActiveTopMenu = (paths: string[]) => {
    return paths.some((path) => currentPath.startsWith(path));
  };

  const isActiveItem = (path: string) => currentPath === path;

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    toast.success("You have been logged out!");
    setTimeout(() => {
      navigate("/app/");
    }, 1000);
  };

  return (
    <header
      className="d-flex justify-content-between align-items-center px-4 py-2"
      style={{ backgroundColor: "#003DA5" }}
    >
      {/* Logo */}
      <div className="d-flex align-items-center me-auto">
        <img src="/logo.png" alt="App Logo" height="50" className="me-3" />
      </div>

      {/* Menu + Profile */}
      <div className="d-flex align-items-center gap-5">
        {/* Menus */}
        <div className="d-flex align-items-center gap-4">
          {/* Dashboard */}
          <div className="dropdown hover-dropdown">
            <span
              className={`fw-semibold ${
                currentPath === "/app/dashboard"
                  ? "active-top-menu"
                  : "text-white"
              }`}
              role="button"
            >
              Dashboard
            </span>
          </div>

          {/* Migration View */}
          <div className="dropdown hover-dropdown">
            <span
              className={`fw-semibold ${
                isActiveTopMenu([
                  "/app/dashboard/variables",
                  "/app/dashboard/packages",
                  "/app/dashboard/usercredentials",
                  "/app/dashboard/oauthcredentials",
                  "/app/dashboard/number-ranges",
                  "/app/dashboard/value-mappings",
                  "/app/dashboard/data-stores",
                  "/app/dashboard/public-certificates",
                  "/app/dashboard/access-policies",
                ])
                  ? "active-top-menu"
                  : "text-white"
              }`}
              role="button"
            >
              Migration View
            </span>
            <ul className="dropdown-menu">
              {[
                { path: "/app/dashboard/variables", label: "Variables" },
                { path: "/app/dashboard/packages", label: "Packages" },
                {
                  path: "/app/dashboard/usercredentials",
                  label: "User Credentials",
                },
                {
                  path: "/app/dashboard/oauthcredentials",
                  label: "OAuth Credentials",
                },
                {
                  path: "/app/dashboard/number-ranges",
                  label: "Number Ranges",
                },
                {
                  path: "/app/dashboard/value-mappings",
                  label: "Value Mappings",
                },
                { path: "/app/dashboard/data-stores", label: "Data Stores" },
                {
                  path: "/app/dashboard/public-certificates",
                  label: "Public Certificates",
                },
                {
                  path: "/app/dashboard/access-policies",
                  label: "Access Policies",
                },
              ].map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    className={`dropdown-item ${
                      isActiveItem(item.path) ? "active" : ""
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Master Config */}
          <div className="dropdown hover-dropdown">
            <span
              className={`fw-semibold ${
                isActiveTopMenu([
                  "/app/dashboard/tenants",
                  "/app/dashboard/profiles",
                ])
                  ? "active-top-menu"
                  : "text-white"
              }`}
              role="button"
            >
              Master Config
            </span>
            <ul className="dropdown-menu">
              {[
                { path: "/app/dashboard/tenants", label: "Tenants" },
                { path: "/app/dashboard/profiles", label: "Profiles" },
              ].map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    className={`dropdown-item ${
                      isActiveItem(item.path) ? "active" : ""
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Profile */}
        <div className="dropdown">
          <button
            className="btn d-flex align-items-center gap-2"
            type="button"
            id="profileDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div
              className="rounded-circle d-flex justify-content-center align-items-center text-white fw-bold"
              style={{
                backgroundColor: "#00bcd4",
                width: "35px",
                height: "35px",
              }}
            >
              {initials}
            </div>
          </button>

          <ul
            className="dropdown-menu dropdown-menu-end"
            aria-labelledby="profileDropdown"
          >
            <li>
              <button
                className="dropdown-item"
                onClick={() => setShowProfSettingModal(true)}
              >
                <i className="bi bi-person-gear me-2"></i> Profile
              </button>
            </li>
            <ProfSettingModal
              show={showProfSettingModal}
              onClose={() => setShowProfSettingModal(false)}
            />
            <li>
              <a className="dropdown-item" href="#" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i> Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
