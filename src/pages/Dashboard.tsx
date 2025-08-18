import React, { useEffect, useState, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "../components/Header";
import { useProfileState } from "../hooks/useProfileState";
import { fetchLoggedInUserData } from "../api/auth";

// Lazy imports
const Tenants = lazy(() => import("./Tenants"));
const Profiles = lazy(() => import("./Profiles"));
const Packages = lazy(() => import("./Packages"));
const UserCredentials = lazy(() => import("./UserCredentials"));
const Variables = lazy(() => import("./Variables"));
const NumberRanges = lazy(() => import("./NumberRanges"));
const ValueMappings = lazy(() => import("./ValueMappings"));
const OAuthCredentials = lazy(() => import("./OAuthCredentials"));
const DataStores = lazy(() => import("./DataStores"));
const PublicCertificates = lazy(() => import("./PublicCertificates"));
const AccessPolicies = lazy(() => import("./AccessPolicies"));

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
        import("./Tenants"),
        import("./Profiles"),
        import("./Packages"),
        import("./UserCredentials"),
        import("./Variables"),
        import("./NumberRanges"),
        import("./ValueMappings"),
        import("./OAuthCredentials"),
        import("./DataStores"),
        import("./PublicCertificates"),
        import("./AccessPolicies"),
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
            <Route path="usercredentials" element={<UserCredentials />} />
            <Route path="oauthcredentials" element={<OAuthCredentials />} />
            <Route path="number-ranges" element={<NumberRanges />} />
            <Route path="value-mappings" element={<ValueMappings />} />
            <Route path="data-stores" element={<DataStores />} />
            <Route path="access-policies" element={<AccessPolicies />} />
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
