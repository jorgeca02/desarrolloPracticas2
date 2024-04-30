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

app.use(
  oakCors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"], // Add other HTTP methods if necessary
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
const port = Deno.env.get("PORT")
if(port)await app.listen({ port:Number(port) });