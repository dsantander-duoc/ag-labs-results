export interface AnalysisRequestResponse {
  analysisRequestId: number;
  patientRut: string;
  laboratoryName: string;
  doctorName: string;
  status: AnalysisRequestStatus;
  requestDate: string;
}

export interface AnalysisRequest {
  patientId: number;
  laboratoryId: number;
  doctorUserId: number;
  status: AnalysisRequestStatus;
}

export enum AnalysisRequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
