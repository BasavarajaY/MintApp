// src/hooks/useProfileState.ts
import { useState } from "react";
import { fetchMintProfiles } from "../api/auth";

export function useProfileState() {
  const [showProfSettingModal, setShowProfSettingModal] = useState(false);

  const checkProfile = async (): Promise<boolean> => {
    const profileData = sessionStorage.getItem("selectedProfile");

    if (!profileData) {
      try {
        const response = await fetchMintProfiles();
        const fetchedProfiles = response.data;

        if (fetchedProfiles.length > 0) {
          sessionStorage.setItem(
            "selectedProfile",
            JSON.stringify(fetchedProfiles[0])
          );
          setShowProfSettingModal(false);
          return true; // ✅ Return boolean
        } else {
          setShowProfSettingModal(true);
          return false;
        }
      } catch (error) {
        console.error("Failed to fetch profiles", error);
        setShowProfSettingModal(true);
        return false;
      }
    }

    return true; // ✅ Already had profile
  };

  return {
    showProfSettingModal,
    setShowProfSettingModal,
    checkProfile,
  };
}
