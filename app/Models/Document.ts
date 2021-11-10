import { BaseModel, column } from "@ioc:Adonis/Lucid/Orm";
import { IAuditTrail } from "App/Utils/interfaces";

export default class Document extends BaseModel {
  @column({ isPrimary: true })
  public id: string;

  @column()
  public original_name: string;
  @column()
  public path: string;

  @column()
  public type: number;
  @column()
  public name: string | undefined;
  @column()
  public description: string | undefined;
  @column()
  public person_type: number | undefined;
  @column()
  public rectifiable: number | undefined;
  @column()
  public active: number | undefined;
  @column()
  public rectifiable_status: number | undefined;
  @column()
  public competitor_path: string | undefined;

  @column()
  public status: number;
  @column()
  public audit_trail: IAuditTrail;
}
