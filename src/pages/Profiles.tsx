import React, { useEffect, useState } from "react";
import {
  createUFMProfiles,
  deleteProfile,
  fetchMintProfiles,
  updateProfile,
} from "../api/auth";
import toast from "react-hot-toast";
import ProfileModal from "./ProfileModal";
import ConfirmDialog from "../components/ConfirmDialog";
import AppSpinner from "../components/common/AppSpinner";

const Profiles: React.FC = () => {
  const [profilesData, setProfilesData] = useState<any>(null);
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
    try {
      const response = await fetchMintProfiles();
      setProfilesData(response.data);
      setFilteredData(response.data);
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
    environment: string;
    source: string;
    destination: string;
  }) => {
    const payload = {
      mint_profile_name: profileData.name,
      mint_profile_environment_id: profileData.environment,
      mint_profile_source_runtime: profileData.source,
      mint_profile_destination_runtime: profileData.destination,
      mint_profile_primary_tenant_id: 1,
      mint_profile_secondary_tenant_id: 2,
      mint_profile_gr_id: 101,
      mint_profile_tenant_state_id: 14001,
      created_by: 1,
    };

    try {
      if (isEdit && selectedProfile?.id) {
        await updateProfile(selectedProfile.id, payload);
        toast.success("Profile updated successfully");
      } else {
        await createUFMProfiles(payload);
        toast.success("Profile added successfully");
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
    setSelectedProfile({
      id: profile.mint_profile_id,
      name: profile.mint_profile_name,
      environment: profile.mint_profile_environment_id,
      source: profile.mint_profile_source_runtime,
      destination: profile.mint_profile_destination_runtime,
    });
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
  if (error) return <div className="text-danger">{error}</div>;

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
              maxWidth: "240px",
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
              <th>Environment</th>
              <th>Source</th>
              <th>Destination</th>
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
                  <td>{profile.mint_profile_environment_id}</td>
                  <td>{profile.mint_profile_source_runtime}</td>
                  <td>{profile.mint_profile_destination_runtime}</td>
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
        onClose={() => {
          setShowProfileModal(false);
          setIsEdit(false);
          setSelectedProfile(null);
        }}
        onAdd={handleAddOrUpdateProfile}
        initialData={selectedProfile}
        isEdit={isEdit}
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
