import { Application, Context, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import { login,getViaje,getViajesPorPersona } from "./resolvers/get.ts";
import { addUser,addViaje,addTransaccion,addPago,joinViaje} from "./resolvers/post.ts";
import { updateBudget } from "./resolvers/put.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const router = new Router();

router
.get("/Login", login)
.get("/getViaje", getViaje)
.get("/getViajePersona",getViajesPorPersona)
.post("/addUser", addUser)
.post("/addViaje", addViaje)
.post("/addTransaccion",addTransaccion)
.post("/addPago",addPago)
.post("/joinViaje",joinViaje)
.put("/updateBudget", updateBudget)

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());
app.use(oakCors());

app.use(
  oakCors({
    origin: "*",
    methods: ["GET", "POST"], // Add other HTTP methods if necessary
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
const port = Deno.env.get("PORT")
if(port)await app.listen({ port:Number(port) });