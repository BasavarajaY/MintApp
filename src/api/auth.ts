import { otpInstance } from './axiosInstance';
import { pageInstance } from './axiosInstance';
const basePath = import.meta.env.DEV ? '/mint_proxy' : 'https://mint-fastapi-app.cfapps.eu10-004.hana.ondemand.com';

interface LoginPayload {
  email: string;
  otp?: string;
}
const getSelectedProfileId = (): number | null => {
  const stored = sessionStorage.getItem("selectedProfile");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed?.mint_profile_id ?? null;
    } catch {
      return null;
    }
  }
  return null;
};

export const requestOtp = async (payload: LoginPayload) => {
  const response = await otpInstance.post(`${basePath}/api/web/auth/request-otp`, payload);
  return response.data;
};
export const verifyOtp = async (payload: LoginPayload) => {
  return otpInstance.post('/mint_proxy/api/web/auth/verify-otp', payload);
};
export const resendOtp = async (payload: LoginPayload) => {
  return otpInstance.post('/mint_proxy/api/web/auth/resend-otp', payload);
};
export const fetchTenants = () => {
  return pageInstance.get('http://localhost:3001/tenent_proxy/api/web/tenants');
};
export const fetchMintProfiles = () => {
  return pageInstance.get('http://localhost:3001/tenent_proxy/api/web/mint-profiles');
};
export const createSourceTenant = async (payload: {
  tenant_name: string;
  tenant_type: string;
}) => {
  return pageInstance.post('http://localhost:3001/tenent_proxy/api/web/tenants/create-source-tenant', payload);
};
export const createTargetTenant = async (payload: {
  tenant_name: string;
  tenant_type: string;
}) => {
  return pageInstance.post('http://localhost:3001/tenent_proxy/api/web/tenants/create-target-tenant', payload);
};
export const createUFMProfiles = async (payload: {
  mint_profile_name: string;
  mint_profile_environment_id: string;
  mint_profile_source_runtime: string;
  mint_profile_destination_runtime: string;
}) => {
  return pageInstance.post('http://localhost:3001/tenent_proxy/api/web/mint-profiles', payload);
};
export const updateProfile = (id: number, data: any) => {
  return pageInstance.put(`http://localhost:3001/tenent_proxy/api/web/mint-profiles/${id}`, data);
};
export const deleteProfile = (profileId: number) => {
  return pageInstance.delete(`http://localhost:3001/tenent_proxy/api/web/mint-profiles/${profileId}`);
};

export const updateTenant = (id: number, data: any) => {
  return pageInstance.put(`http://localhost:3001/tenent_proxy/api/web/tenants/${id}`, data);
};
export const deleteTenant = (tenantId: number) => {
  return pageInstance.delete(`http://localhost:3001/tenent_proxy/api/web/tenants/${tenantId}`);
};

export const fetchPackages = () => {
  const profileId = getSelectedProfileId();
  return pageInstance.get(`http://localhost:3001/tenent_proxy/api/web/prepackaged-content/${profileId}`);
};
export const fetchPackageDetails = async (packageId: string) => {
  return await pageInstance.get(`/source_proxy/api/v1/IntegrationPackages('${packageId}')/IntegrationDesigntimeArtifacts`);
};
export const migratePackages = async (payload: {
  module_type: string;
  data: {
    Id: string;
    Name: string;
    Version: string;
  }[];
  created_by: number;
}) => {
  const profileId = getSelectedProfileId();
  return pageInstance.post(`http://localhost:3001/tenent_proxy/api/web/variables/${profileId}`, payload);
};
export const fetchVariables = () => {
  const profileId = getSelectedProfileId();
  return pageInstance.get(`http://localhost:3001/tenent_proxy/api/web/variables/${profileId}`);
};
export const createVariables = async (payload: {
  module_type: string;
  data: {
    VariableName: string;
    IntegrationFlow: string;
    Visibility: string;
    UpdatedAt: string;
    RetainUntil: string;
  }[];
  created_by: number;
}) => {
  const profileId = getSelectedProfileId();
  return pageInstance.post(`http://localhost:3001/tenent_proxy/api/web/variables/${profileId}`, payload);
};
export const migrateVariables = async (payload: {
  module_type: string;
  data: {
    VariableName: string;
    IntegrationFlow: string;
    Visibility: string;
    UpdatedAt: string;
    RetainUntil: string;
  }[];
  created_by: number;
}) => {
  const profileId = getSelectedProfileId();
  return pageInstance.post(`http://localhost:3001/tenent_proxy/api/web/variables/${profileId}`, payload);
};
export const fetchTaskStatus = async (taskId: string) => {
  return pageInstance.get(`http://localhost:3001/tenent_proxy/api/web/variables/status/${taskId}`);
};
export const fetchUserCredentials = () => {
  const profileId = getSelectedProfileId();
  return pageInstance.get(`http://localhost:3001/tenent_proxy/api/web/user-credentials/${profileId}`);
};
export const migrateUserCreds = async (payload: {
  module_type: string;
  data: {
    Name: string;
    Kind: string;
    Description: string;
    User: string;
    Password: string;
    CompanyId: string;
  }[];
  created_by: number;
}) => {
  const profileId = getSelectedProfileId();
  return pageInstance.post(`http://localhost:3001/tenent_proxy/api/web/user-credentials/${profileId}`, payload);
};
export const fetchUserCredTaskStatus = async (taskId: string) => {
  return pageInstance.get(`http://localhost:3001/tenent_proxy/api/web/user-credentials/status/${taskId}`);
};


/*export const fetchTenant = async () => {
  const token = localStorage.getItem("accessToken");

  const response = await fetch("http://localhost:3001/tenent_proxy/api/web/tenants", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch tenants: ${response.status} ${errorText}`);
  }

  return await response.json();
};*/

