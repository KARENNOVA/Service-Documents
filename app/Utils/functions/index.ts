import Env from "@ioc:Adonis/Core/Env";
import axios from "axios";
import { IResponseData } from "../interfaces";

export const getDataUser = async (token: string) => {
  // const { id } = decodeJWT(token);

  // Consulting
  try {
    // User.findOrFail(payload.id);
    const axiosResponse = await axios.get(
      `${Env.get("URI_SERVICE_AUTH")}${Env.get("API_AUTH_VERSION")}/users`,
      {
        // params: { id },
        headers: { authorization: token },
      }
    );
    return axiosResponse.data.results.detailsUser;
  } catch (error) {
    console.error(error);
    return error;
    // return response.unauthorized({
    //   error: "Debe de ingresar para realizar esta acción",
    // });
  }

  // try {
  //   const detailsUser = await DetailsUser.query().where("user_id", id);

  //   return detailsUser[0];
  // } catch (error) {
  //   console.error(error);
  // }
};
export const messageError = (
  error: any = {
    name: "Desconocido",
    message: "Error desconocido.\nRevisar Terminal.",
  },
  response: any,
  initialMessage: string = "Ha ocurrido un error inesperado",
  initialStatus: number = 500
) => {
  let responseData: IResponseData = {
    message: initialMessage,
    status: initialStatus,
  };
  responseData.error = { name: error.name, message: error.message };

  // Error 23505
  if (Number(error.code) === 23505)
    responseData.message =
      "Error interno controlable. Realice la consulta hasta que le funcione. :)";

  if (responseData["status"] === 401)
    responseData["error"] = {
      name: "Unauthorized",
      message:
        "No se encuentra autorizado para obtener la información solicitada.",
    };

  if (responseData["status"] === 400)
    responseData["error"] = {
      name: "Bad Request",
      message:
        "Sintaxis inválida. El servidor no puede entender la información solicitada o no enviada.",
    };

  console.error(error);
  return response.status(responseData["status"]).json(responseData);
};
