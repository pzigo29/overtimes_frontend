export interface Employee
{
  employeeId: number; //PK
  personalNumber: string; //change
  username: string;
  levelRole: number;
  managerId: number | null; //FK Employee
  costCenter: string;
  firstName: string;
  lastName: string;
  email: string;
  employed: boolean;
  approver: boolean;
}

export interface Delegate
{
  employeeId: number; //FK Employee //PK
  mainApproverId: number; //FK Employee
}

export interface OvertimeLimit
{
  limitId: number; //PK
  employeeId: number; //FK Employee
  minHours: number;
  maxHours: number;
  startDate: Date;
  endDate: Date;
  statusId: string; //change // FK ApprovalStatus
}

export interface Approval
{
  approvalId: number; //PK
  limitId: number; //change // FK OvertimeLimit
  approverId: number; //FK Employee
  approvalDate: Date;
  statusId: string | null; // FK ApprovalStatus
  comment: string | null;
}

export interface Overtime
{
  overtimeId: number; //PK
  employeeId: number; //change //FK Employee
  overtimeTypeId: number; //FK OvertimeType
  creationDate: Date;
  overtimeDay: Date; //change
  overtimeHours: number;
  reason: string | null;
  projectNumber: string | null; //change
  //status_id: string; //change
}

export interface Notification
{
  notificationId: number; //PK
  employeeId: number; //FK Employee
  limitId: number; //change // FK OvertimeLimit
  message: string | null;
  dateSent: Date;
}

export interface OvertimeType
{
  overtimeTypeId: number; //PK
  typeName: string;
}

export interface ApprovalStatus
{
  statusId: string; //PK
  status: string | null;
}