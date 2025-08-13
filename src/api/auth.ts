import { otpInstance } from './axiosInstance';
import { pageInstance } from './axiosInstance';

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
  const response = await otpInstance.post(`/web/auth/request-otp`, payload);
  return response.data;
};
export const verifyOtp = async (payload: LoginPayload) => {
  return otpInstance.post(`/web/auth/verify-otp`, payload);
};
export const resendOtp = async (payload: LoginPayload) => {
  return otpInstance.post(`/web/auth/resend-otp`, payload);
};
export const fetchTenants = () => {
  return pageInstance.get(`/web/tenants/`);
};
export const fetchMintProfiles = () => {
  return pageInstance.get('/web/mint-profiles/');
};
export const createSourceTenant = async (payload: {
  tenant_name: string;
  tenant_type: string;
}) => {
  return pageInstance.post('/web/tenants/create-source-tenant/', payload);
};
export const createTargetTenant = async (payload: {
  tenant_name: string;
  tenant_type: string;
}) => {
  return pageInstance.post('/web/tenants/create-target-tenant/', payload);
};
export const createUFMProfiles = async (payload: {
  mint_profile_name: string;
  mint_profile_environment_id: string;
  mint_profile_source_runtime: string;
  mint_profile_destination_runtime: string;
}) => {
  return pageInstance.post('/web/mint-profiles/', payload);
};
export const updateProfile = (id: number, data: any) => {
  return pageInstance.put(`/web/mint-profiles/${id}/`, data);
};
export const deleteProfile = (profileId: number) => {
  return pageInstance.delete(`/web/mint-profiles/${profileId}/`);
};

export const updateTenant = (id: number, data: any) => {
  return pageInstance.put(`/web/tenants/${id}/`, data);
};
export const deleteTenant = (tenantId: number) => {
  return pageInstance.delete(`/web/tenants/${tenantId}/`);
};

export const fetchPackages = () => {
  const profileId = getSelectedProfileId();
  return pageInstance.get(`/web/prepackaged-content/${profileId}`);
};
export const fetchPackageDetails = async (packageId: string) => {
  return await pageInstance.get(`/v1/IntegrationPackages('${packageId}')/IntegrationDesigntimeArtifacts`);
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
  return pageInstance.post(`/web/variables/${profileId}`, payload);
};
export const fetchVariables = () => {
  const profileId = getSelectedProfileId();
  return pageInstance.get(`/web/variables/${profileId}`);
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
  return pageInstance.post(`/web/variables/${profileId}`, payload);
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
  return pageInstance.post(`/web/variables/${profileId}`, payload);
};
export const fetchVariablesTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/variables/status/${taskId}`);
};
export const fetchUserCredentials = () => {
  const profileId = getSelectedProfileId();
  return pageInstance.get(`/web/user-credentials/${profileId}`);
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
  return pageInstance.post(`/web/user-credentials/${profileId}`, payload);
};
export const fetchUserCredTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/user-credentials/status/${taskId}`);
};
export const fetchOAuthCredentials = () => {
  const profileId = getSelectedProfileId();
  return pageInstance.get(`/web/oauth2-credentials/${profileId}`);
};
export const migrateOAuthCreds = async (payload: {
  module_type: string;
  data: {
    Name: string;
    Description: string;
    TokenServiceUrl: string;
    ClientId: string;
    Scope: string;
    Resource: string;
  }[];
  created_by: number;
}) => {
  const profileId = getSelectedProfileId();
  return pageInstance.post(`/web/oauth2-credentials/${profileId}`, payload);
};
export const fetchOAuthCredTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/oauth2-credentials/status/${taskId}`);
};
export const fetchNumberRanges = () => {
  const profileId = getSelectedProfileId();
  return pageInstance.get(`/web/number-ranges/${profileId}`);
};
export const migrateNumberRanges = async (payload: {
  module_type: string;
  data: {
    Name: string;
    Description: string;
    MinValue: string;
    MaxValue: string;
    Rotate: string;
    CurrentValue: string;
    FieldLength: string;
    DeployedBy: string;
    DeployedOn: Date;
  }[];
  created_by: number;
}) => {
  const profileId = getSelectedProfileId();
  return pageInstance.post(`/web/number-ranges/${profileId}`, payload);
};
export const fetchNumberRangesTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/number-ranges/status/${taskId}`);
};
export const fetchValueMappings = () => {
  const profileId = getSelectedProfileId();
  return pageInstance.get(`/web/value-mappings/${profileId}`);
};
export const migrateValueMappings = async (payload: {
  module_type: string;
  data: {
    Id: string;
    Version: string;
    PackageId: string;
    Name: string;
    Description: string;
    ArtifactContent: string;
  }[];
  created_by: number;
}) => {
  const profileId = getSelectedProfileId();
  return pageInstance.post(`/web/value-mappings/${profileId}`, payload);
};
export const fetchValueMappingsTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/value-mappings/status/${taskId}`);
};

