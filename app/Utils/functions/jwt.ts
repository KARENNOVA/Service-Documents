import jwt from "jsonwebtoken";
import Env from "@ioc:Adonis/Core/Env";

export const decodeJWT = (token: string) => {
  try {
    let payload = jwt.verify(token, Env.get("APP_KEY_AUTH") || "secret");
    return payload;
  } catch (error) {
    console.error(error);
  }
};

export const getToken = (
  headers
): { token: string; headerAuthorization: string } => {
  let token: string = "";
  let headerAuthorization = headers.authorization ? headers.authorization : "";

  if (headerAuthorization !== "") {
    token = headerAuthorization.replace("Bearer ", "").trim();
  }

  return { token, headerAuthorization };
};
