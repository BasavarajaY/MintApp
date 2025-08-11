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
}
