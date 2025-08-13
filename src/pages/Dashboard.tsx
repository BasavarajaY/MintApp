import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "../components/Header";
import Tenants from "./Tenants";
import Profiles from "./Profiles";
import Packages from "./Packages";
import UserCredentials from "./UserCredentials";
import Variables from "./Variables";
import { fetchMintProfiles } from "../api/auth";
import NumberRanges from "./NumberRanges";
import ValueMappings from "./ValueMappings";
import OAuthCredentials from "./OAuthCredentials";

const Dashboard: React.FC = () => {
  const [showProfSettingModal, setShowProfSettingModal] = useState(false);
  useEffect(() => {
    const checkProfile = async () => {
      const profileData = sessionStorage.getItem("selectedProfile");

      if (!profileData) {
        try {
          const response = await fetchMintProfiles();
          const fetchedProfiles = response.data;

          if (fetchedProfiles.length > 0) {
            // Auto-select first profile and save it
            sessionStorage.setItem(
              "selectedProfile",
              JSON.stringify(fetchedProfiles[0])
            );
            setShowProfSettingModal(false); // no modal needed
          } else {
            // No profiles available - force user to select via modal
            setShowProfSettingModal(true);
          }
        } catch (error) {
          console.error("Failed to fetch profiles", error);
          // Optionally open modal or handle error accordingly
          setShowProfSettingModal(true);
        }
      }
    };

    checkProfile();
  }, []);

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
          {/* <Route path="" element={<div>Select an option from the menu.</div>} /> */}
          <Route
            path=""
            element={
              showProfSettingModal ? null : (
                <Navigate to="/dashboard/variables" replace />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
