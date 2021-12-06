export interface IResponseData {
  message: string;
  results?: any;
  status: number;
  error?: any;
  page?: number;
  count?: number;
  next_page?: number;
  previous_page?: number;
  total_results?: number;
}

export * from "./auditTrail";
export * from "./docs";
export * from "./detailsUser";
