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
      navigate("/app");
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
          {/* Dashboard (non-clickable) */}
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
                ])
                  ? "active-top-menu"
                  : "text-white"
              }`}
              role="button"
            >
              Migration View
            </span>
            <ul className="dropdown-menu">
              <li>
                <a
                  className={`dropdown-item fw-bold ${
                    isActiveItem("/app/dashboard/variables")
                      ? "active-menu"
                      : ""
                  }`}
                  href="/app/dashboard/variables"
                >
                  Variables
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item fw-bold ${
                    isActiveItem("/app/dashboard/packages") ? "active-menu" : ""
                  }`}
                  href="/app/dashboard/packages"
                >
                  Packages
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item fw-bold ${
                    isActiveItem("/app/dashboard/usercredentials")
                      ? "active-menu"
                      : ""
                  }`}
                  href="/app/dashboard/usercredentials"
                >
                  User Credintials
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item fw-bold ${
                    isActiveItem("/app/dashboard/oauthcredentials")
                      ? "active-menu"
                      : ""
                  }`}
                  href="/app/dashboard/oauthcredentials"
                >
                  OAuth Credintials
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item fw-bold ${
                    isActiveItem("/app/dashboard/number-ranges")
                      ? "active-menu"
                      : ""
                  }`}
                  href="/app/dashboard/number-ranges"
                >
                  Number Ranges
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item fw-bold ${
                    isActiveItem("/app/dashboard/value-mappings")
                      ? "active-menu"
                      : ""
                  }`}
                  href="/app/dashboard/value-mappings"
                >
                  Value Mappings
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item fw-bold ${
                    isActiveItem("/app/dashboard/data-stores")
                      ? "active-menu"
                      : ""
                  }`}
                  href="/app/dashboard/data-stores"
                >
                  Data Stores
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item fw-bold ${
                    isActiveItem("/app/dashboard/public-certificates")
                      ? "active-menu"
                      : ""
                  }`}
                  href="/app/dashboard/public-certificates"
                >
                  Public Certificates
                </a>
              </li>
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
              <li>
                <a
                  className={`dropdown-item fw-bold ${
                    isActiveItem("/app/dashboard/tenants") ? "active-menu" : ""
                  }`}
                  href="/app/dashboard/tenants"
                >
                  Tenants
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item fw-bold ${
                    isActiveItem("/app/dashboard/profiles") ? "active-menu" : ""
                  }`}
                  href="/app/dashboard/profiles"
                >
                  Profiles
                </a>
              </li>
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
