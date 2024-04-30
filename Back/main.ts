import { Application, Context, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import { login,getViaje } from "./resolvers/get.ts";
import { addUser,addViaje } from "./resolvers/post.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const router = new Router();

router
.get("/Login", login)
.get("/getViaje", getViaje)
.post("/addUser", addUser)
.post("/addViaje", addViaje)

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());
app.use(oakCors());

app.use(async (ctx: Context, next) => {
    // Llamar a next() para continuar con el siguiente middleware
    await next();
  
    // Configurar los encabezados de la respuesta
    ctx.response.headers.set("Content-Type", "application/json; charset=utf-8");
    ctx.response.headers.set("Server", "Kestrel");
  });

const port = Deno.env.get("PORT")
if(port)await app.listen({ port:Number(port) });