import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { Context } from "https://deno.land/x/oak@v11.1.0/context.ts";

import { ViajesCollection, UsersCollection } from "../db/mongo.ts";
import { ViajeSchema, UserSchema } from "../db/schemas.ts";
import { Viaje,ViajePersona,Transaccion, User } from "../types.ts";
import { GridFSFindOptions } from "https://deno.land/x/mongo@v0.31.1/src/types/gridfs.ts";


type PostUserContext = RouterContext<
  "/addUser",
  Record<string | number, string | undefined>,
  Record<string, any>
>;
type PostViajeContext = RouterContext<
  "/addViaje",
  Record<string | number, string | undefined>,
  Record<string, any>
>;


export const addUser = async (ctx:PostUserContext) => {
    const response = await ctx.request.body({type:"json"})
    console.log(response)
    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.headers.set("Access-Control-Allow-Origin","*")
    const value = await response.value

    if(!value.username || !value.password){
        ctx.response.body = {msg: "faltan parametros, parametros necesarios: name,password"}
        ctx.response.status=400
        console.log(ctx.response)
        return
    } else if(await UsersCollection.findOne({username:value.username})){
        ctx.response.body = {msg: "Ya existe un usuario con este nombre"}
        ctx.response.status=400  
        console.log(ctx.response)
        return
    }else{
        const newuser: User = {
            username:value.username,
            password:value.password,
        };
        await UsersCollection.insertOne(newuser as UserSchema)
        ctx.response.body = newuser;
        ctx.response.status = 200;      
        console.log(ctx.response)          
        return;
    }   
}
export const addViaje = async (ctx:PostViajeContext) => {
    const response = await ctx.request.body({type:"json"})
    console.log(response)
    const value = await response.value
    if(!value.name||!value.personas||value.personas.length==0){
        ctx.response.body = {message: "faltan parametros, parametros necesarios: name,personas"}
        ctx.response.status=400
        return
    }else{
        const newviaje: Viaje = {
            name:value.name,
            personas:value.personas,
        };
        await ViajesCollection.insertOne(newviaje as ViajeSchema)
        ctx.response.body = newviaje;
        ctx.response.status = 200;                
        return;
    }   
}
