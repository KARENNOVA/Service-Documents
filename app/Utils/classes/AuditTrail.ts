import { http } from "Config/app";
import jwt from "jsonwebtoken";
import moment from "moment";
import { IDataToken, IDataUser, IUpdatedValues } from "../interfaces";

export default class AuditTrail {
  private token: string | null;
  private dataUser: IDataUser;
  protected createdBy: string;
  protected createdOn: number;
  protected updatedBy: string | null;
  protected updatedOn: number | null;
  protected updatedValues: IUpdatedValues | null;

  constructor(token?: string) {
    this.token = token ? token : null;

    this.dataUser = { id: 1, name: "Administrador" };
    // if (this.token !== null) {
    //   const decodedJWT = this.decodeJWT();

    //   this.createdBy = decodedJWT.auditTrail.createdBy;
    // }
    this.createdBy = this.dataUser.name;
    this.createdOn = moment().valueOf();
    this.updatedBy = null;
    this.updatedOn = null;
    this.updatedValues = null;
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
      created_by: "Administrador",
      created_on: moment().valueOf(),
      updated_by: null,
      updated_on: null,
      updated_values: null,
    };
  }

  // PRIVATE METHODS
  private decodeJWT() {
    try {
      let decode = jwt.verify(this.token, "your-256-bit-secret");
      console.log(decode);
      return decode;
    } catch (error) {
      console.error(error);
    }
  }

  private getDataUser(id: number): any {
    //   http.
  }

  // PUBLIC METHODS
  /**
   * registry
   */
  public registry() {}

  // export const newAuditTrail = (token: string = ""): IAuditTrail => {
  //     if (token === "") {
  //       let auditTrail: IAuditTrail = {
  //         created_by: "Administrador",
  //         created_on: String(new Date().getTime()),
  //         updated_by: null,
  //         updated_on: null,
  //         updated_values: null,
  //       };
  //       return auditTrail;
  //     }
  //     return {
  //       created_by: "Administrador",
  //       created_on: String(new Date().getTime()),
  //       updated_by: null,
  //       updated_on: null,
  //       updated_values: null,
  //     };
  //   };
}
