import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
// import { getToken } from "App/Utils/functions/jwt";

export default class ImagesController {
  public async index({}: HttpContextContract) {}

  public async insert({}: /*request, response*/ HttpContextContract) {
    // const { token } = getToken(request.headers());
    // const images = request.files("image");
  }

  public async store({}: HttpContextContract) {}

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}
}
