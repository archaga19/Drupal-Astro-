export interface DrupalUser {
  uid?: Array<{ value: number }>;
  name?: Array<{ value: string }>;
  mail?: Array<{ value: string }>;
  roles?: Array<{ target_id: string }>;
}