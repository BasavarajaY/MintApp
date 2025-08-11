// src/components/Header.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Header.css"; // we'll add this next
import ProfSettingModal from "../pages/ProfSettingModal";
import { useLocation } from "react-router-dom";

interface HeaderProps {
  showProfSettingModal: boolean;
  setShowProfSettingModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header: React.FC<HeaderProps> = ({
  showProfSettingModal,
  setShowProfSettingModal,
}) => {
  const navigate = useNavigate();
  // const [showProfSettingModal, setShowProfSettingModal] = useState(false);

  const location = useLocation();
  const currentPath = location.pathname;

  const isActiveTopMenu = (paths: string[]) => {
    return paths.some((path) => currentPath.startsWith(path));
  };

  const isActiveItem = (path: string) => currentPath === path;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    toast.success("Logged out successfully");
    navigate("/");
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
                currentPath === "/dashboard" ? "active-top-menu" : "text-white"
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
                  "/dashboard/variables",
                  "/dashboard/packages",
                  "/dashboard/usercredentials",
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
                    isActiveItem("/dashboard/variables") ? "active-menu" : ""
                  }`}
                  href="/dashboard/variables"
                >
                  Variables
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item fw-bold ${
                    isActiveItem("/dashboard/packages") ? "active-menu" : ""
                  }`}
                  href="/dashboard/packages"
                >
                  Packages
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item fw-bold ${
                    isActiveItem("/dashboard/usercredentials")
                      ? "active-menu"
                      : ""
                  }`}
                  href="/dashboard/usercredentials"
                >
                  User Credintials
                </a>
              </li>
            </ul>
          </div>

          {/* Master Config */}
          <div className="dropdown hover-dropdown">
            <span
              className={`fw-semibold ${
                isActiveTopMenu(["/dashboard/tenants", "/dashboard/profiles"])
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
                    isActiveItem("/dashboard/tenants") ? "active-menu" : ""
                  }`}
                  href="/dashboard/tenants"
                >
                  Tenants
                </a>
              </li>
              <li>
                <a
                  className={`dropdown-item fw-bold ${
                    isActiveItem("/dashboard/profiles") ? "active-menu" : ""
                  }`}
                  href="/dashboard/profiles"
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
              YB
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
              <a
                className="dropdown-item"
                href="/settings"
                onClick={handleLogout}
              >
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
