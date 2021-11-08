// import jwt from "jsonwebtoken";
import moment from "moment";
import { IDataUser, IUpdatedValues } from "../interfaces";

export default class AuditTrail {
  private token: string | null;
  private dataUser: IDataUser;
  protected createdBy: string;
  protected createdOn: number;
  protected updatedBy: string | null;
  protected updatedOn: number | null;
  protected updatedValues: IUpdatedValues | null;

  constructor(token?: string, auditTrail?: any) {
    this.token = token ? token : null;

    this.dataUser = { id: 1, name: "Administrador" };
    if (this.token !== null) {
      //   const decodedJWT = this.decodeJWT();
      //   this.createdBy = decodedJWT.auditTrail.createdBy;
    }
    if (auditTrail) {
      this.createdBy = auditTrail.created_by;
      this.createdOn = auditTrail.created_on;
      this.updatedBy = auditTrail.updated_by;
      this.updatedOn = auditTrail.updated_on;
      this.updatedValues = auditTrail.updated_values;
    } else {
      this.createdBy = this.dataUser.name;
      this.createdOn = moment().valueOf();
      this.updatedBy = null;
      this.updatedOn = null;
      this.updatedValues = null;
    }
  }

  // GETTERS AND SETTERS
  /**
   * getCreatedBy
   */
  public getCreatedBy() {
    return this.createdBy.trim();
  }

  /**
   * getCreatedOn
   */
  public getCreatedOn() {
    return this.createdOn;
  }

  /**
   * getUpdatedBy
   */
  public getUpdatedBy(): string | null {
    return this.updatedBy;
  }

  /**
   * getUpdatedOn
   */
  public getUpdatedOn() {
    if (this.updatedOn === null) return null;
    return this.updatedOn;
  }

  /**
   * getUpdatedValues
   */
  public getUpdatedValues() {
    return this.updatedValues;
  }

  /**
   * getAsJson
   */
  public getAsJson() {
    return {
      created_by: this.createdBy,
      created_on: this.createdOn,
      updated_by: this.updatedBy === null ? null : this.updatedBy,
      updated_on: this.updatedOn === null ? null : this.updatedOn,
      updated_values: this.updatedValues === null ? null : this.updatedValues,
    };
  }

  // PRIVATE METHODS

  // PUBLIC METHODS
  /**
   * registry
   */
  public registry() {}

  public update(updatedBy: string, updatedValues: any, model: any) {
    this.updatedBy = updatedBy;
    this.updatedOn = moment().valueOf();

    let tmpData: any = { ...model["$attributes"] };
    let tmpDataNew: any = { ...tmpData };

    delete updatedValues.audit_trail;

    delete tmpDataNew.id;
    delete tmpDataNew.audit_trail;

    let _updatedValues: IUpdatedValues = {
      lastest: { ...tmpDataNew },
      new: updatedValues,
    };

    if (tmpData.audit_trail?.updated_values)
      if (!tmpData.audit_trail.updated_values.oldest) {
        delete tmpData.audit_trail;
        delete tmpData.id;
        _updatedValues.oldest = { ...tmpData };
      } else _updatedValues.oldest = tmpData.audit_trail.updated_values.oldest;

    this.updatedValues = _updatedValues;
  }
}
