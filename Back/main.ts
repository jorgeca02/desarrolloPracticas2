import { Application, Context, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import { getBooks, getUser } from "./resolvers/get.ts";
import { addUser, addBook, addAuthor } from "./resolvers/post.ts";
import { updateCart} from "./resolvers/put.ts";
import { deleteUser } from "./resolvers/delete.ts";

const router = new Router();

router

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());
const port = Deno.env.get("PORT")
if(port)await app.listen({ port:Number(port) });