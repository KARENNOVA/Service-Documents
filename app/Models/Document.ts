import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";
import { IAuditTrail } from "App/Utils/interfaces";

export default class Document extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public name: string;
  @column()
  public original_name: string;
  @column()
  public path: string;

  @column()
  public status: number;
  @column()
  public audit_trail: IAuditTrail;
}
