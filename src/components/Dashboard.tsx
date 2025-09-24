import React, { useEffect, useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./Header";
import { useProfileState } from "../hooks/useProfileState";
import { fetchLoggedInUserData } from "../api/auth";

// Lazy imports
const Tenants = lazy(() => import("../pages/Tenants"));
const Profiles = lazy(() => import("../pages/Profiles"));
const Packages = lazy(() => import("../pages/Packages"));
const UserCredentials = lazy(() => import("../pages/UserCredentials"));
const Variables = lazy(() => import("../pages/Variables"));
const CertToServKey = lazy(() => import("../pages/CertToServKey"));
const CustomTags = lazy(() => import("../pages/CustomTags"));
const NumberRanges = lazy(() => import("../pages/NumberRanges"));
const ValueMappings = lazy(() => import("../pages/ValueMappings"));
const OAuthCredentials = lazy(() => import("../pages/OAuthCredentials"));
const DataStores = lazy(() => import("../pages/DataStores"));
const PublicCertificates = lazy(() => import("../pages/PublicCertificates"));
const AccessPolicies = lazy(() => import("../pages/AccessPolicies"));
const CustomContent = lazy(() => import("../pages/CustomContent"));

const Dashboard: React.FC = () => {
  const { showProfSettingModal, setShowProfSettingModal } = useProfileState();
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const profileData = sessionStorage.getItem("selectedProfile");

      if (!profileData) {
        setShowProfSettingModal(true);
        setProfileExists(false);
      } else {
        setProfileExists(true);
      }

      try {
        const response = await fetchLoggedInUserData();
        const data = response.data?.user || [];
        sessionStorage.setItem("loggedInUser", JSON.stringify(data));
      } catch (err) {
        console.error("Error fetching Logged-in user data:", err);
      }
    };

    initialize();
  }, [setShowProfSettingModal]);

  // Prefetch lazy components
  useEffect(() => {
    const prefetch = async () => {
      await Promise.all([
        import("../pages/Tenants"),
        import("../pages/Profiles"),
        import("../pages/Packages"),
        import("../pages/UserCredentials"),
        import("../pages/Variables"),
        import("../pages/CertToServKey"),
        import("../pages/CustomTags"),
        import("../pages/NumberRanges"),
        import("../pages/ValueMappings"),
        import("../pages/OAuthCredentials"),
        import("../pages/DataStores"),
        import("../pages/PublicCertificates"),
        import("../pages/AccessPolicies"),
        import("../pages/CustomContent"),
      ]);
    };
    prefetch();
  }, []);

  return (
    <div>
      <Header
        showProfSettingModal={showProfSettingModal}
        setShowProfSettingModal={setShowProfSettingModal}
      />

      {profileExists && (
        <Suspense>
          <Routes>
            <Route path="tenants" element={<Tenants />} />
            <Route path="profiles" element={<Profiles />} />
            <Route path="packages" element={<Packages />} />
            <Route path="variables" element={<Variables />} />
            <Route path="cert-servkey" element={<CertToServKey />} />
            <Route path="custom-tags" element={<CustomTags />} />
            <Route path="user-credentials" element={<UserCredentials />} />
            <Route path="oauth-credentials" element={<OAuthCredentials />} />
            <Route path="number-ranges" element={<NumberRanges />} />
            <Route path="value-mappings" element={<ValueMappings />} />
            <Route path="data-stores" element={<DataStores />} />
            <Route path="access-policies" element={<AccessPolicies />} />
            <Route path="custom-content" element={<CustomContent />} />

            <Route
              path="public-certificates"
              element={<PublicCertificates />}
            />
            <Route index element={<Navigate to="tenants" replace />} />
          </Routes>
        </Suspense>
      )}
    </div>
  );
};

export default Dashboard;
