import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Application from "@ioc:Adonis/Core/Application";
import Env from "@ioc:Adonis/Core/Env";
import fs from "fs";

// MODELS
import Document from "App/Models/Document";

// UTILS
import AuditTrail from "./../../Utils/classes/AuditTrail";
import { IAuditTrail, IUpdatedValues } from "App/Utils/interfaces/auditTrail";
import moment from "moment";
import { getToken } from "App/Utils/functions/jwt";
import { messageError } from "App/Utils/functions";
import { IResponseData } from "./../../Utils/interfaces/index";
import { saveArchives } from "App/Utils/functions/saveArchives";
import { Path } from "App/Utils/enums";

export default class DocsController {
  // POST
  /**
   * uploadDocs
   */
  public async upload({ request, response }: HttpContextContract) {
    const { token } = getToken(request.headers());

    const pdfs = request.files("pdf", {
      size: "500mb",
      extnames: ["pdf"],
    });

    if (!pdfs || pdfs.length === 0) {
      return messageError(
        undefined,
        response,
        "Ingrese el Documento a insertar.",
        400
      );
    }

    let multipleDataToCreate: any[] = [];
    await Promise.all(
      pdfs.map(async (pdf) => {
        if (!pdf.isValid) {
          return messageError(
            pdf.errors,
            response,
            "Inserte un documento válido.",
            400
          );
        }

        let id = '';
        await saveArchives(response, Env, pdf, Path.SABI_PATH_DOCS, (_id) => { id = _id} );

        // Create ID
        // let date = new Date();

        // const id = `${date.getFullYear()}${date.getMonth()}${date.getDay()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}`;
        // // END Create ID

        // const path =
        //   request.qs()["from"] === "sabi"
        //     ? Env.get("SABI_PATH_DOCS")
        //     : Env.get("CULTURE_PATH_DOCS");
        // const tmpPath = path || "uploads/tmp";
        // let tmpName = `${id} - ${pdf.clientName}`;

        // try {
        //   await pdf.move(Application.tmpPath(tmpPath), {
        //     name: tmpName,
        //   });
        // } catch (error) {
        //   return messageError(
        //     error,
        //     response,
        //     "Error moviendo el archivo.",
        //     500
        //   );
        // }

        let name: string = pdf.clientName.replace(/\.pdf/gi, "");
        if (request.body().name) name = request.body().name;

        const auditTrail: AuditTrail = new AuditTrail(token);
        await auditTrail.init();

        let dataToCreate: any = {
          id,
          name,
          original_name: pdf.clientName,
          path: pdf.filePath,
          status: 1,
          audit_trail: auditTrail.getAsJson(),
        };

        dataToCreate.type = parseInt(request.body().type);
        if (request.body().description) {
          dataToCreate.description = request.body().description;
        }
        if (request.body().person_type) {
          dataToCreate.person_type = parseInt(request.body().person_type);
        }
        if (request.body().rectifiable) {
          dataToCreate.rectifiable = parseInt(request.body().rectifiable);
        }
        if (request.body().active) {
          dataToCreate.active = parseInt(request.body().active);
        }
        if (request.body().rectifiable_status) {
          dataToCreate.rectifiable_status = parseInt(
            request.body().rectifiable_status
          );
        }
        if (request.body().competitor_path) {
          dataToCreate.competitor_path = request.body().competitor_path;
        }
        multipleDataToCreate.push(dataToCreate);
      })
    );
    try {
      const documents = await Document.createMany(multipleDataToCreate);

      return response.json({
        message: "¡PDF(s) guardado exitosamente!",
        results: documents,
      });
    } catch (error) {
      return messageError(error, response, "Error al guardar el archivo.", 500);
    }
  }

  // GET
  /**
   * download
   */
  public async download(ctx) {
    try {
      const { id } = ctx.request.params();

      const documents = await Document.query().where("id", id);

      return ctx.response.download(documents[0].path, documents[0].name);
    } catch (error) {
      return ctx.response.json({
        message: "Error descargando el archivo.",
        error,
      });
    }
  }

  /**
   * details
   */
  public async details(ctx: HttpContextContract, _id?: string) {
    let id;

    if (_id) id = _id;
    else id = ctx.request.qs().id;

    try {
      const documents = await Document.query()
        .from("documents as d")
        .select(["d.name as name_doc", "d.id as id_doc", "*"])
        .innerJoin("status as s", "d.status", "s.id")
        .where("d.id", id);

      if (_id) return documents[0];
      return ctx.response.json({
        message: `Información detallada del documento ${documents[0]["id"]}`,
        results: {
          ...documents[0]["$attributes"],
          status: documents[0]["$attributes"]["name"],
          name: documents[0]["$extras"]["name_doc"],
          id: documents[0]["$extras"]["id_doc"],
        },
      });
    } catch (error) {
      console.error(error);
      return ctx.response.json({
        message: "Error al obtener los detalles del Documento",
        error: error,
      });
    }
  }

  /**
   * getAll
   */
  public async getAll(ctx: HttpContextContract) {
    try {
      const documents = await Document.query()
        .from("documents as d")
        .select(["d.name as name_doc", "d.id as id_doc", "*"])
        .innerJoin("status as s", "d.status", "s.id");

      let results: any[] = [];
      documents.map((doc) => {
        results.push({
          ...doc["$attributes"],
          id: doc["$extras"]["id_doc"],
          status: doc["$attributes"]["name"],
          name: doc["$extras"]["name_doc"],
        });
      });

      results = results.sort((a, b) => b.id - a.id);

      return ctx.response.json({
        message: "Documentos agregados en la Base de Datos",
        results,
      });
    } catch (error) {
      return ctx.response.json({
        message: "Error obteniendo todos los documentos",
        error,
      });
    }
  }

  /**
   * getMany
   */
  public async getMany(ctx: HttpContextContract) {
    const { ids } = ctx.request.qs();
    let responseData: IResponseData = {
      message: "Información detallada de los documentos.",
      status: 200,
    };

    if (!ids) {
      responseData["message"] = "El BI aún no tiene documentos relacionados.";
      responseData["results"] = [];
      return ctx.response.status(responseData["status"]).json(responseData);
    }
    let idsArray: string[] = ids.split(",");

    try {
      const documents = await Document.findMany(idsArray);

      return ctx.response.json({
        message: `Información detallada de los documentos con ID: ${idsArray.join(
          ", "
        )}`,
        results: documents,
      });
    } catch (error) {
      console.error(error);
      return ctx.response.json({
        message: "Error al obtener los detalles del Documento",
        error: error,
      });
    }
  }

  // PUT
  /**
   * update
   */
  public async update(ctx: HttpContextContract) {
    const pdf = ctx.request.file("pdf", {
      size: "500mb",
      extnames: ["pdf"],
    });
    const newData = ctx.request.body();
    const { id } = ctx.request.qs();

    try {
      if (typeof id === "string") {
        const document = await Document.findOrFail(id);

        const lastestValues = { ...document["$attributes"] };
        delete lastestValues["audit_trail"];
        let updatedValues: IUpdatedValues = {
          lastest: {
            ...lastestValues,
          },
          new: newData,
        };

        let tmpData: any = { ...document["$attributes"] };
        if (tmpData.audit_trail?.updated_values)
          if (!tmpData.audit_trail.updated_values.oldest) {
            const oldestValues = { ...document["$attributes"] };
            delete oldestValues["audit_trail"];

            updatedValues.oldest = {
              ...oldestValues,
            };
          } else
            updatedValues.oldest = tmpData.audit_trail.updated_values.oldest;

        let auditTrail: IAuditTrail = {
          created_by: tmpData.audit_trail?.created_by,
          created_on: tmpData.audit_trail?.created_on,
          updated_by: "Administrator",
          updated_on: moment().valueOf(),
          updated_values: updatedValues,
        };

        let tmpName = `${document.id} - ${pdf?.clientName}`;
        fs.unlink(document["path"], (err) => {
          if (err) {
            if (err.code !== "ENOENT") throw err;
          }
          console.log(
            "File deleted: " +
              document["path"].split("/tmp/core/").pop()?.trim()
          );
        });

        let newPath = `${document.path.split("core\\").shift()?.trim()}core\\`;
        console.log(newPath);

        if (typeof newPath === "string")
          await pdf?.move(newPath, { name: tmpName, overwrite: true });

        // Updating data
        try {
          const results = await document
            .merge({
              ...newData,
              original_name: pdf?.clientName,
              path: pdf?.filePath,
              audit_trail: auditTrail,
            })
            .save();

          return ctx.response
            .status(200)
            .json({ message: "Dirección Actualizada.", results });
        } catch (error) {
          console.error(error);
          return ctx.response
            .status(500)
            .json({ message: "Error al actualizar: Servidor", error });
        }
      }
    } catch (error) {
      console.error(error);
      return ctx.response
        .status(500)
        .json({ message: "Error interno: Servidor", error });
    }
  }

  // DELTE
  /**
   * delete
   */
  public async delete(ctx: HttpContextContract) {
    const { request, response } = ctx;
    const { token } = getToken(request.headers());
    const { id } = request.params();

    if (id && typeof id === "string") {
      try {
        const document = await Document.findOrFail(id);

        fs.unlink(document["path"], (err) => {
          if (err) {
            if (err.code !== "ENOENT") throw err;
          }
          console.log(
            "Documento borrado: " +
              document["path"].split("/tmp/core/").pop()?.trim()
          );
        });

        const auditTrail = new AuditTrail(token);
        await auditTrail.update({ status: 2 }, document);

        let newDoc = await document
          .merge({
            status: 2,
            audit_trail: auditTrail.getAsJson(),
          })
          .save();

        return response.status(200).json({
          message: "Documento eliminado y registro actualizado.",
          results: newDoc,
        });
      } catch (error) {
        return messageError(error, response, undefined, 500);
      }
    }
  }
}
