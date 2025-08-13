import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfileState } from "../../hooks/useProfileState";
import AppSpinner from "./AppSpinner";

export default function RequireProfile({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const { checkProfile, showProfSettingModal } = useProfileState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ensureProfile = async () => {
      await checkProfile();
      setLoading(false);

      if (showProfSettingModal) {
        navigate("/app/dashboard");
      }
    };

    ensureProfile();
  }, [checkProfile, navigate, showProfSettingModal]);

  if (loading) {
    return (
      <div>
        <AppSpinner />
      </div>
    );
  }

  return <>{children}</>;
}
