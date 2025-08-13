import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "../components/Header";
import Tenants from "./Tenants";
import Profiles from "./Profiles";
import Packages from "./Packages";
import UserCredentials from "./UserCredentials";
import Variables from "./Variables";
import NumberRanges from "./NumberRanges";
import ValueMappings from "./ValueMappings";
import OAuthCredentials from "./OAuthCredentials";
import { useProfileState } from "../hooks/useProfileState";
import { Spinner } from "react-bootstrap";

const Dashboard: React.FC = () => {
  const { showProfSettingModal, setShowProfSettingModal } = useProfileState();

  const [loadingProfileCheck, setLoadingProfileCheck] = useState(true);
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      const profileData = sessionStorage.getItem("selectedProfile");
      if (!profileData) {
        setShowProfSettingModal(true); // open modal automatically
        setProfileExists(false);
      } else {
        setProfileExists(true);
      }
      setLoadingProfileCheck(false);
    };
    checkProfile();
  }, [setShowProfSettingModal]);

  // Still checking → show loader
  if (loadingProfileCheck) {
    return (
      <div style={{ padding: "20px" }}>
        <Spinner />
      </div>
    );
  }

  // No profile → only header + modal, block routes
  if (!profileExists) {
    return (
      <div>
        <Header
          showProfSettingModal={showProfSettingModal}
          setShowProfSettingModal={setShowProfSettingModal}
        />
        {/* Modal opens automatically */}
      </div>
    );
  }

  // Profile exists → load routes
  return (
    <div>
      <Header
        showProfSettingModal={showProfSettingModal}
        setShowProfSettingModal={setShowProfSettingModal}
      />
      <div>
        <Routes>
          <Route path="tenants" element={<Tenants />} />
          <Route path="profiles" element={<Profiles />} />
          <Route path="packages" element={<Packages />} />
          <Route path="variables" element={<Variables />} />
          <Route path="usercredentials" element={<UserCredentials />} />
          <Route path="oauthcredentials" element={<OAuthCredentials />} />
          <Route path="number-ranges" element={<NumberRanges />} />
          <Route path="value-mappings" element={<ValueMappings />} />
          <Route index element={<Navigate to="tenants" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
