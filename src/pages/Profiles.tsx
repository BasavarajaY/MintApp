// src/pages/Profiles.tsx
import React, { useEffect, useState } from "react";
import {
  createUFMProfiles,
  deleteProfile,
  fetchMintProfiles,
  fetchTenants,
  updateProfile,
} from "../api/auth";
import toast from "react-hot-toast";
import ProfileModal from "./ProfileModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import AppSpinner from "../components/common/AppSpinner";
import ErrorState from "../components/common/ErrorState";

const storedUser = sessionStorage.getItem("loggedInUser");
const userData = storedUser ? JSON.parse(storedUser) : null;

const Profiles: React.FC = () => {
  const [profilesData, setProfilesData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isEdit, setIsEdit] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<any | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const profilesRes = await fetchMintProfiles();
      const profiles = profilesRes.data;

      const tenantsRes = await fetchTenants();
      const tenants = tenantsRes.data?.tenants;

      // Build a map of tenant_id → tenant_name
      const tenantMap: Record<number, string> = {};
      tenants.forEach((t: any) => {
        tenantMap[t.tenant_id] = t.tenant_name;
      });

      // Enrich profiles with tenant_name
      const enrichedProfiles = profiles.map((p: any) => ({
        ...p,
        source_tenant_name:
          tenantMap[p.mint_profile_primary_tenant_id] || "Unknown Tenant",
        target_tenant_name:
          tenantMap[p.mint_profile_secondary_tenant_id] || "Unknown Tenant",
      }));

      // ✅ 5. Set state
      setProfilesData(enrichedProfiles);
      setFilteredData(enrichedProfiles);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateProfile = async (profileData: {
    id?: number | undefined;
    name: string;
    environment: Number;
    source: string;
    destination: string;
    sourceTenantId: number;
    targetTenantId: number;
    created_by: string | number;
    modified_by: string | number;
  }) => {
    const payload = {
      mint_profile_name: profileData.name,
      mint_profile_environment_id: profileData.environment,
      mint_profile_source_runtime: profileData.source,
      mint_profile_destination_runtime: profileData.destination,
      mint_profile_primary_tenant_id: profileData.sourceTenantId,
      mint_profile_secondary_tenant_id: profileData.targetTenantId,
      mint_profile_gr_id: 101,
      mint_profile_tenant_state_id: 14001,
      created_by: userData?.id.toString(),
      modified_by: userData?.id.toString(),
    };

    try {
      if (isEdit && selectedProfile?.mint_profile_id) {
        await updateProfile(selectedProfile.mint_profile_id, payload);
        toast.success("Profile updated successfully");
      } else {
        await createUFMProfiles(payload);
        toast.success("Profile created successfully");
      }
      await loadProfiles();
    } catch (err) {
      toast.error("Failed to save profile");
    } finally {
      setShowProfileModal(false);
      setSelectedProfile(null);
      setIsEdit(false);
    }
  };

  useEffect(() => {
    if (profilesData) {
      const filtered = profilesData.filter((profile: any) =>
        profile.mint_profile_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, profilesData]);

  const handleEdit = (profile: any) => {
    setSelectedProfile(profile);
    setIsEdit(true);
    setShowProfileModal(true);
  };

  const handleDeleteClick = (profile: any) => {
    setProfileToDelete(profile);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProfile(profileToDelete.mint_profile_id);
      toast.success("Profile deleted successfully");
      await loadProfiles();
    } catch (err) {
      toast.error("Failed to delete profile");
    } finally {
      setShowDeleteDialog(false);
      setProfileToDelete(null);
    }
  };

  if (loading) return <AppSpinner text="Loading Profiles..." />;
  if (error) {
    return (
      <ErrorState
        message={error || "Failed to load data."}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0" style={{ color: "#003DA5" }}>
          Profiles
        </h4>
        <div className="d-flex gap-2 align-items-center">
          <input
            type="text"
            placeholder="Search..."
            className="form-control"
            style={{
              border: "1px solid #003DA5",
              borderRadius: "5px",
              color: "#003DA5",
              width: "350px",
            }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="btn btn-outline-primary fw-bold"
            onClick={() => {
              setShowProfileModal(true);
              setIsEdit(false);
              setSelectedProfile(null);
            }}
          >
            ＋
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "10px",
          color: "#003DA5",
        }}
      >
        <table className="table mb-0 table-appblue" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Profile Name</th>
              <th>Source Tenant Name</th>
              <th>Target Tenant Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData?.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center text-muted">
                  No profiles found
                </td>
              </tr>
            ) : (
              filteredData?.map((profile: any) => (
                <tr key={profile.mint_profile_id}>
                  <td>{profile.mint_profile_id}</td>
                  <td>{profile.mint_profile_name}</td>
                  <td>{profile.source_tenant_name}</td>
                  <td>{profile.target_tenant_name}</td>
                  <td>
                    <div className="d-flex gap-3 align-items-center">
                      <i
                        className="bi bi-pencil-square"
                        style={{
                          color: "#FFC107",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                        }}
                        title="Edit"
                        onClick={() => handleEdit(profile)}
                      ></i>
                      <i
                        className="bi bi-trash"
                        style={{
                          color: "#DC3545",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                        }}
                        title="Delete"
                        onClick={() => handleDeleteClick(profile)}
                      ></i>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ProfileModal
        show={showProfileModal}
        handleClose={() => {
          setShowProfileModal(false);
          setIsEdit(false);
          setSelectedProfile(null);
        }}
        handleSave={handleAddOrUpdateProfile}
        initialData={selectedProfile}
      />

      <ConfirmDialog
        show={showDeleteDialog}
        message={`Are you sure you want to delete profile "${profileToDelete?.mint_profile_name}"?`}
        onCancel={() => {
          setShowDeleteDialog(false);
          setProfileToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Profiles;
