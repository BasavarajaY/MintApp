export interface MigrationStatus {
  task_id?: string;
  process_status?: string;
  progress_percentage?: number;
  success_message?: string;
  error_message?: string;
}

export interface PackageItem extends MigrationStatus {
  Id: string;
  Name: string;
  Version: string;
  [key: string]: any;
  CreationDate: string;
}
export interface VariableItem extends MigrationStatus {
  VariableName: string;
  IntegrationFlow: string;
  Visibility: string;
  UpdatedAt: string;
  RetainUntil: string;
}
export interface UserCredItem extends MigrationStatus {
  Name: string;
  Kind: string;
  Description: string;
  User: string;
  Password: string;
  CompanyId: string;
}
export interface OAuthCredItem extends MigrationStatus {
  Name: string;
  Description: string;
  TokenServiceUrl: string;
  ClientId: string;
  Scope: string;
  Resource: string;
}
export interface NumberRangesItem extends MigrationStatus {
  Name: string;
  Description: string;
  MinValue: string;
  MaxValue: string;
  Rotate: string;
  CurrentValue: string;
  FieldLength: string;
  DeployedBy: string;
  DeployedOn: Date;
}
export interface ValueMappingsItem extends MigrationStatus {
  Id: string;
  Version: string;
  PackageId: string;
  Name: string;
  Description: string;
  ArtifactContent: string;
}
export interface DataStoresItem extends MigrationStatus {
  DataStoreName: string;
  IntegrationFlow: string;
  Type: string;
  Visibility: string;
  NumberOfMessages: string;
  NumberOfOverdueMessages: string;
}
export interface PublicCertsItem extends MigrationStatus {
  Hexalias: string;
  Alias: string;
  Type: string;
  Owner: string;
}
export interface AccessPolsItem extends MigrationStatus {
  Id: string;
  RoleName: string;
  Description: string;
}
export interface CustomContentItem extends MigrationStatus {
  Id: string;
  Name: string;
  Description: string;
  ShortText: string;
  SupportedPlatform: string;
  ModifiedBy: string;
  CreationDate: string;
  ModifiedDate: string;
}
