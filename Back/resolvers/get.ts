import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { BooksCollection, UsersCollection } from "../db/mongo.ts";
import { BookSchema, UserSchema } from "../db/schemas.ts";
import { helpers } from "https://deno.land/x/oak@v11.1.0/mod.ts";

type LoginContext = RouterContext<
  "/Login",
  {
    user: string;
    pw:string
  } & Record<string | number, string | undefined>,
  Record<string, any>
>;

export const login = async (context: LoginContext) => {
  const params = helpers.getQuery(context, { mergeParams: true });
  if(!params?.user){
    context.response.status = 400;
    context.response.body = {msg: "faltan parametros:usuario"}
    return
  }if(!params?.pw){
    context.response.status = 400;
    context.response.body = {msg: "faltan parametros:contraseña"}
    return
  }else{  
    console.log(params?.user);
    console.log(params?.pw);
    const user: UserSchema|undefined = await UsersCollection.findOne({
      username:params?.user
      })  
      console.log(user);
    if(user){
      context.response.status = 200;
      context.response.body = user
      return;
    }else{
      context.response.status = 404;
      context.response.body="notFound"
      return
    }
  }
}
