import Application from "@ioc:Adonis/Core/Application";
import { messageError } from "App/Utils/functions";

export const saveArchives = async ( response, Env, archive, _path, callback ) => {

  const date_aux = new Date();
  let date = `${date_aux.getFullYear().toString().substring(2)}${((date_aux.getMonth() + 1) < 10 ? '0' : '') + (date_aux.getMonth() + 1)}${(date_aux.getDate() < 10 ? '0' : '') + date_aux.getDate()}`;
  const id = new Date().getTime();


  const path = Env.get(_path);

  // console.log(path)
    // request.qs()["from"] === "sabi"
    //   ? Env.get("SABI_PATH_DOCS")
    //   :
  const tmpPath = path || "uploads/tmp";
  let tmpName = `${id}/${date}_${id} - ${archive.clientName}`;

  try {
    await archive.move(Application.makePath(tmpPath), {
      name: tmpName,
    });
    callback && callback(id)
  } catch (error) {
    return messageError(
      error,
      response,
      "Error moviendo el archivo.",
      500
    );
  }



}

