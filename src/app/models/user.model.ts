export interface User {
    personUserName: string;
    personalNumber: string;
    costCenter: string;
    overtimeMaxLimit: number;
    overtimeMinLimit: number;
    realOvertime: number;
    teamLeader: User | null;
    segmentManager: User | null;
  }