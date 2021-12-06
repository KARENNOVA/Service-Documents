import { IAuditTrail } from ".";

export interface INames {
  firstName: string;
  lastName?: string;
}

export interface ISurnames {
  firstSurname: string;
  lastSurname?: string;
}

export interface IDetailsUser {
  id?: number;

  society_type: string;
  entity_type: string;
  politics?: boolean;
  notification?: boolean;

  id_type: string;
  id_number: string;
  names: INames;
  surnames: ISurnames;
  email: string;
  location: string;
  cellphone_number?: number;
  phone_number: number;
  gender: string;

  user_id: number;

  status?: number;
  audit_trail?: IAuditTrail;
}
