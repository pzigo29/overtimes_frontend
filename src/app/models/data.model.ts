export interface Employee
{
  employeeId: number;
  personalNumber: string; //change
  username: string;
  levelRole: number;
  managerId: number | null;
  costCenter: string;
  firstName: string;
  lastName: string;
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