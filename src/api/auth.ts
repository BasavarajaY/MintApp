// src/api/auth.ts
import type { LoginPayload, RegisterPayload, AccessPolsItem, CustomContentItem, DataStoresItem, NumberRangesItem, OAuthCredItem, PackageItem, PublicCertsItem, UserCredItem, ValueMappingsItem, VariableItem, CertToServKeyItem, CustomTagsItem } from '../types';
import { otpInstance } from './axiosInstance';
import { pageInstance } from './axiosInstance';

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
const profileId = getSelectedProfileId();

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
export const fetchLoggedInUserData = () => {
  return pageInstance.get(`/web/auth/me`);
};

export const onboardingRegister = async (payload: RegisterPayload) => {
  const response = await otpInstance.post(`/web/onboarding/register`, payload);
  return response.data;
};
export const onboardingSendotp = async (payload: RegisterPayload) => {
  const response = await otpInstance.post(`/web/onboarding/send-otp`, payload);
  return response.data;
};
export const onboardingVerifyotp = async (payload: RegisterPayload) => {
  const response = await otpInstance.post(`/web/onboarding/verify-otp`, payload);
  return response.data;
};

export const fetchTenants = () => {
  return pageInstance.get(`/web/tenants/`);
};
export const fetchMintProfiles = () => {
  return pageInstance.get('/web/mint-profiles/');
};
// Create Source Tenant (Neo)
export const createSourceTenant = async (payload: {
  tenant_name: string;
  tenant_type: string;
  tenant_token_url: string;
  tenant_client_id: string;
  tenant_client_secret: string;
  tenant_api_url: string;
  tenant_neo_domain: string;
  tenant_neo_client_id: string;
  tenant_neo_client_secret: string;
  tenant_neo_account_id: string;
  tenant_neo_iflow_host: string;
  tenant_neo_iflow_user: string;
  tenant_neo_iflow_password: string;
  created_by?: number;
}) => {
  return pageInstance.post("/web/tenants/create-source-tenant", payload);
};

// Create Target Tenant (CF)
export const createTargetTenant = async (payload: {
  tenant_name: string;
  tenant_type: string;
  tenant_token_url: string;
  tenant_client_id: string;
  tenant_client_secret: string;
  tenant_api_url: string;
  tenant_cf_domain: string;
  tenant_cf_user: string;
  tenant_cf_password: string;
  tenant_cf_org_id: string;
  tenant_cf_space_name: string;
  created_by?: number;
}) => {
  return pageInstance.post("/web/tenants/create-target-tenant", payload);
};
export const createUFMProfiles = async (payload: {
  mint_profile_name: string;
  mint_profile_environment_id: Number;
  mint_profile_source_runtime: string;
  mint_profile_destination_runtime: string;
  mint_profile_primary_tenant_id: number;
  mint_profile_secondary_tenant_id: number;
  mint_profile_gr_id: number;
  mint_profile_tenant_state_id: number,
  created_by: string | number;
  modified_by: string | number;
}) => {
  return pageInstance.post('/web/mint-profiles/', payload);
};

export const updateProfile = (id: number, data: any) => {
  return pageInstance.put(`/web/mint-profiles/${id}`, data);
};
export const deleteProfile = (profileId: number) => {
  return pageInstance.delete(`/web/mint-profiles/${profileId}`);
};

export const updateTenant = (id: number, data: any) => {
  return pageInstance.put(`/web/tenants/${id}/`, data);
};
export const deleteTenant = (tenantId: number) => {
  return pageInstance.delete(`/web/tenants/${tenantId}/`);
};

export const fetchPackages = () => {
  return pageInstance.get(`/web/prepackaged-content/${profileId}`);
};
export const fetchPackageDetails = async (packageId: string) => {
  return await pageInstance.get(`/v1/IntegrationPackages('${packageId}')/IntegrationDesigntimeArtifacts`);
};
export const migratePackages = async (payload: {
  module_type: string;
  data: PackageItem[];
  created_by: number;
}) => {
  return pageInstance.post(`/web/prepackaged-content/${profileId}`, payload);
};
export const fetchPackagesTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/prepackaged-content/status/${taskId}`);
};
export const fetchVariables = () => {
  return pageInstance.get(`/web/variables/${profileId}`);
};
export const createVariables = async (payload: {
  module_type: string;
  data: VariableItem[];
  created_by: number;
}) => {
  return pageInstance.post(`/web/variables/${profileId}`, payload);
};
export const migrateVariables = async (payload: {
  module_type: string;
  data: VariableItem[];
  created_by: number;
}) => {
  return pageInstance.post(`/web/variables/${profileId}`, payload);
};
export const fetchVariablesTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/variables/status/${taskId}`);
};
export const fetchUserCredentials = () => {
  return pageInstance.get(`/web/user-credentials/${profileId}`);
};
export const migrateUserCreds = async (payload: {
  module_type: string;
  data: UserCredItem[];
  created_by: number;
}) => {
  return pageInstance.post(`/web/user-credentials/${profileId}`, payload);
};
export const fetchUserCredTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/user-credentials/status/${taskId}`);
};
export const fetchOAuthCredentials = () => {
  return pageInstance.get(`/web/oauth2-credentials/${profileId}`);
};
export const migrateOAuthCreds = async (payload: {
  module_type: string;
  data: OAuthCredItem[];
  created_by: number;
}) => {
  return pageInstance.post(`/web/oauth2-credentials/${profileId}`, payload);
};
export const fetchOAuthCredTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/oauth2-credentials/status/${taskId}`);
};
export const fetchNumberRanges = () => {
  return pageInstance.get(`/web/number-ranges/${profileId}`);
};
export const migrateNumberRanges = async (payload: {
  module_type: string;
  data: NumberRangesItem[];
  created_by: number;
}) => {
  return pageInstance.post(`/web/number-ranges/${profileId}`, payload);
};
export const fetchNumberRangesTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/number-ranges/status/${taskId}`);
};
export const fetchValueMappings = () => {
  return pageInstance.get(`/web/value-mappings/${profileId}`);
};
export const migrateValueMappings = async (payload: {
  module_type: string;
  data: ValueMappingsItem[];
  created_by: number;
}) => {
  return pageInstance.post(`/web/value-mappings/${profileId}`, payload);
};
export const fetchValueMappingsTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/value-mappings/status/${taskId}`);
};
export const fetchDataStores = () => {
  return pageInstance.get(`/web/datastores/${profileId}`);
};
export const migrateDataStores = async (payload: {
  module_type: string;
  data: DataStoresItem[];
  created_by: number;
}) => {
  return pageInstance.post(`/web/datastores/${profileId}`, payload);
};
export const fetchDataStoresTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/datastores/status/${taskId}`);
};
export const fetchPublicCerts = () => {
  return pageInstance.get(`/web/datastores/${profileId}`);
};
export const migratePublicCerts = async (payload: {
  module_type: string;
  data: PublicCertsItem[];
  created_by: number;
}) => {
  return pageInstance.post(`/web/datastores/${profileId}`, payload);
};
export const fetchPublicCertsTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/datastores/status/${taskId}`);
};
export const fetchAccessPols = () => {
  return pageInstance.get(`/web/access-policies/${profileId}`);
};
export const migrateAccessPols = async (payload: {
  module_type: string;
  data: AccessPolsItem[];
  created_by: number;
}) => {
  return pageInstance.post(`/web/access-policies/${profileId}`, payload);
};
export const fetchAccessPolsTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/access-policies/status/${taskId}`);
};
export const fetchCustomContent = () => {
  return pageInstance.get(`/web/custom-content/${profileId}`);
};
export const migrateCustomContent = async (payload: {
  module_type: string;
  data: CustomContentItem[];
  created_by: number;
}) => {
  return pageInstance.post(`/web/custom-content/${profileId}`, payload);
};
export const fetchCustomContentTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/custom-content/status/${taskId}`);
};
export const fetchCertToServKey = () => {
  return pageInstance.get(`/web/service-key-certificates/certificate-user-mappings/${profileId}`);
};
export const migrateCertToServKey = async (payload: {
  module_type: string;
  data: CertToServKeyItem[];
  created_by: number;
}) => {
  return pageInstance.post(`/web/service-key-certificates/certificate-user-mappings/${profileId}`, payload);
};
export const fetchCertToServKeyTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/service-key-certificates/certificate-user-mappings/status/${taskId}`);
};
export const fetchCustomTags = () => {
  return pageInstance.get(`/web/custom-tags/${profileId}`);
};
export const migrateCustomTags = async (payload: {
  module_type: string;
  data: CustomTagsItem[];
  created_by: number;
}) => {
  return pageInstance.post(`/web/custom-tags/${profileId}`, payload);
};
export const fetchCustomTagsTaskStatus = async (taskId: string) => {
  return pageInstance.get(`/web/custom-tags/status/${taskId}`);
};


