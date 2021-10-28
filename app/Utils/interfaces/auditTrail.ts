export interface IUpdatedValues {
  oldest?: IUpdatedValues | object;
  lastest?: IUpdatedValues | object;
  new: IUpdatedValues | object;
}

export interface IAuditTrail {
  created_by?: string;
  created_on?: number;
  updated_by: string | null;
  updated_on: number | null;
  updated_values: IUpdatedValues | null;
}
