export interface PackageItem {
  Id: string;
  Name: string;
  Version: string;
  [key: string]: any;
  task_id?: string;
  process_status?: string;
  progress_percentage?: number;
}
export interface VariableItem {
  VariableName: string;
  IntegrationFlow: string;
  Visibility: string;
  UpdatedAt: string;
  RetainUntil: string;
  task_id?: string;
  process_status?: string;
  progress_percentage?: number;
  success_message?: string;
  error_message?: string;
}
export interface UserCredItem {
  Name: string;
  Kind: string;
  Description: string;
  User: string;
  Password: string;
  CompanyId: string;
  task_id?: string;
  process_status?: string;
  progress_percentage?: number;
  success_message?: string;
  error_message?: string;
}
export interface OAuthCredItem {
  Name: string;
  Description: string;
  TokenServiceUrl: string;
  ClientId: string;
  Scope: string;
  Resource: string;
  task_id?: string;
  process_status?: string;
  progress_percentage?: number;
}
export interface NumberRangesItem {
  Name: string;
  Description: string;
  MinValue: string;
  MaxValue: string;
  Rotate: string;
  CurrentValue: string;
  FieldLength: string;
  DeployedBy: string;
  DeployedOn: Date;
  task_id?: string;
  process_status?: string;
  progress_percentage?: number;
}
export interface ValueMappingsItem {
  Id: string;
  Version: string;
  PackageId: string;
  Name: string;
  Description: string;
  ArtifactContent: string;
  task_id?: string;
  process_status?: string;
  progress_percentage?: number;
}
export interface DataStoresItem {
  DataStoreName: string;
  IntegrationFlow: string;
  Type: string;
  Visibility: string;
  NumberOfMessages: string;
  NumberOfOverdueMessages: string;
  task_id?: string;
  process_status?: string;
  progress_percentage?: number;
}
export interface PublicCertsItem {
  Hexalias: string;
  Alias: string;
  Type: string;
  Owner: string;
  task_id?: string;
  process_status?: string;
  progress_percentage?: number;
}
export interface AccessPolsItem {
  Id: string;
  RoleName: string;
  Description: string;
  task_id?: string;
  process_status?: string;
  progress_percentage?: number;
}

