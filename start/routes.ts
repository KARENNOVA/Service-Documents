/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/
import Route from "@ioc:Adonis/Core/Route";

Route.group(() => {
  Route.group(() => {
    Route.post("/upload", async (ctx) => {
      const { default: DocsController } = await import(
        "App/Controllers/Http/DocsController"
      );
      return new DocsController().uploadDocs(ctx);
    });

    Route.get("/download/:id", async (ctx) => {
      const { default: DocsController } = await import(
        "App/Controllers/Http/DocsController"
      );
      return new DocsController().download(ctx);
    });

    Route.get("/:id", async (ctx) => {
      const { default: DocsController } = await import(
        "App/Controllers/Http/DocsController"
      );
      return new DocsController().details(ctx);
    });

    Route.get("/", async (ctx) => {
      const { default: DocsController } = await import(
        "App/Controllers/Http/DocsController"
      );

      if (ctx.request.qs().ids) {
        return new DocsController().getMany(ctx);
      }

      return new DocsController().getAll(ctx);
    });

    Route.put("/", async (ctx) => {
      const { default: DocsController } = await import(
        "App/Controllers/Http/DocsController"
      );
      return new DocsController().update(ctx);
    });

    Route.delete("/", async (ctx) => {
      const { default: DocsController } = await import(
        "App/Controllers/Http/DocsController"
      );
      return new DocsController().delete(ctx);
    });
  }).prefix("/docs");
}).prefix("/v1");
