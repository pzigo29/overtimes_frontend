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