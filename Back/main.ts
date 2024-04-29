import { Application, Context, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import { login } from "./resolvers/get.ts";
import { addUser } from "./resolvers/post.ts";

const router = new Router();

router
.get("/Login", login)
.post("/addUser", addUser)

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());
const port = Deno.env.get("PORT")
if(port)await app.listen({ port:Number(port) });