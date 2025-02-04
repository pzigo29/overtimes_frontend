export interface User {
    personUserName: string;
    firstName: string;
    lastName: string;
    personalNumber: string;
    costCenter: string;
    overtimeMaxLimit: number;
    overtimeMinLimit: number;
    realOvertime: number;
    manager: User | null;
    dSegment: string | null;
  }

export interface Employee
{
  employee_id: number;
  personal_number: string; //change
  username: string;
  level_role: number;
  manager_id: number | null;
  cost_center: string;
  first_name: string;
  last_name: string;
  email: string;
  employed: boolean;
  approver: boolean;
}

export interface Delegate
{
  employee_id: number;
  main_approver_id: number;
}

export interface OvertimeLimit
{
  limit_id: number;
  employee_id: number;
  min_hours: number;
  max_hours: number;
  start_date: Date;
  end_date: Date;
  status_id: string; //change
}

export interface Approval
{
  approval_id: number;
  limit_id: number; //change
  approver_id: number;
  approval_date: Date;
  status_id: string | null;
  comment: string | null;
}

export interface Overtime
{
  overtime_id: number;
  employee_id: number; //change
  overtime_type_id: number;
  creation_date: Date;
  overtime_day: Date; //change
  overtime_hours: number;
  reason: string | null;
  project_number: string | null; //change
  //status_id: string; //change
}

export interface Notification
{
  notification_id: number;
  employee_id: number;
  limit_id: number; //change
  message: string | null;
  date_sent: Date;
}

export interface OvertimeType
{
  overtime_type_id: number;
  type_name: string;
}

export interface ApprovalStatus
{
  status_id: string;
  status: string | null;
}