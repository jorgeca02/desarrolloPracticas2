import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { Context } from "https://deno.land/x/oak@v11.1.0/context.ts";

import { AuthorsCollection, BooksCollection, UsersCollection } from "../db/mongo.ts";
import { AuthorSchema, BookSchema, UserSchema } from "../db/schemas.ts";
import { Author, Book, User } from "../types.ts";
import { GridFSFindOptions } from "https://deno.land/x/mongo@v0.31.1/src/types/gridfs.ts";


type PostUserContext = RouterContext<
  "/addUser",
  Record<string | number, string | undefined>,
  Record<string, any>
>;


export const addUser = async (ctx:PostUserContext) => {
    const response = await ctx.request.body({type:"json"})
    console.log(response)
    const value = await response.value

    if(!value.username || !value.password){
        ctx.response.body = {message: "faltan parametros, parametros necesarios: name,password"}
        ctx.response.status=400
        return
    } else if(await UsersCollection.findOne({username:value.username})){
        ctx.response.body = {message: "Ya existe un usuario con este nombre"}
        ctx.response.status=400  
        return
    }else{
        const newuser: User = {
            username:value.username,
            password:value.password,
        };
        await UsersCollection.insertOne(newuser as UserSchema)
        ctx.response.body = newuser;
        ctx.response.status = 200;                
        return;
    }   
}
