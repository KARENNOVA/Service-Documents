import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import Application from "@ioc:Adonis/Core/Application";
import fs from "fs";

// MODELS
import Document from "App/Models/Document";

// UTILS
import AuditTrail from "./../../Utils/classes/AuditTrail";
import { IAuditTrail, IUpdatedValues } from "App/Utils/interfaces/auditTrail";
import moment from "moment";

export default class DocsController {
  // POST
  /**
   * uploadDocs
   */
  public async uploadDocs({ request, response }: HttpContextContract) {
    const pdf = request.file("pdf", {
      size: "500mb",
      extnames: ["pdf"],
    });

    if (!pdf) {
      return;
    }

    if (!pdf.isValid) {
      return pdf.errors;
    }

    // Create ID
    let date = new Date();

    let id = `${date.getFullYear()}${date.getMonth()}${date.getDay()}-${date.getHours()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}`;
    // END Create ID

    const tmpPath = "uploads/core";
    let tmpName = `${id} - ${pdf.clientName}`;

    try {
      await pdf.move(Application.tmpPath(tmpPath), {
        name: tmpName,
      });
    } catch (error) {
      return response.json({
        message: "Error moviendo el archivo.",
        error,
      });
    }

    let name: string = "";
    if (request.body().name) {
      name = request.body().name;
    } else {
      name = pdf.clientName.replace(/\.pdf/gi, "");
    }

    const auditTrail: AuditTrail = new AuditTrail();
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

    try {
      const document = await Document.create(dataToCreate);

      return response.json({
        message: "¡PDF guardado exitosamente!",
        results: document,
      });
    } catch (error) {
      console.error(error);

      return response.json({
        message: "Error guardando el archivo.",
        error,
      });
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
    else id = ctx.request.params().id;

    try {
      const documents: any = await Document.query().where("id", id);

      if (_id) return documents[0];
      return ctx.response.json({
        message: `Información detallada del documento ${documents[0]["id"]}`,
        results: documents[0],
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
      const results = await Document.all();

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
    let detailsArray: any[] = [];
    let idsArray: string[] = ids.split(",");

    // await idsArray.map(async (id) => {
    //   console.log(id);
    //   const tmp = await this.details(ctx, id.trim());
    //   console.log(tmp["$attributes"]);

    //   detailsArray.push(tmp["$attributes"]);
    // });

    try {
      const documents = await Document.findMany(idsArray);
      console.log(documents);
      documents.map((document) => {
        detailsArray.push(document["$attributes"]);
      });

      return ctx.response.json({
        message: `Información detallada de los documentos con ID: ${idsArray.join(
          ", "
        )}`,
        results: detailsArray,
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
    const { id } = ctx.request.params();

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

        const auditTrail = new AuditTrail(undefined, document.audit_trail);
        auditTrail.update("Administrador", { status: 2 }, Document);

        await document.merge({
          status: 2,
          audit_trail: auditTrail.getAsJson(),
        });

        let newDoc = await document.save();

        return ctx.response.status(200).json({
          message: "Documento eliminado y registro actualizado.",
          results: newDoc,
        });
      } catch (error) {
        console.error(error);
        return ctx.response
          .status(500)
          .json({ message: "Error interno del Servidor", error });
      }
    }
  }
}
