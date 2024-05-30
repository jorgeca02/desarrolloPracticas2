import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { Context } from "https://deno.land/x/oak@v11.1.0/context.ts";

import { ViajesCollection, UsersCollection } from "../db/mongo.ts";
import { ViajeSchema, UserSchema } from "../db/schemas.ts";
import { Viaje, ViajePersona, Transaccion, User } from "../types.ts";
import { GridFSFindOptions } from "https://deno.land/x/mongo@v0.31.1/src/types/gridfs.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";

import { helpers } from "https://deno.land/x/oak@v11.1.0/mod.ts";

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
type AddBudget = RouterContext<
    "/addTransaccion",
    {
        u: string;
        v: string;
    } & Record<string | number, string | undefined>,
    Record<string, any>
>;
type AddPago = RouterContext<
    "/addPago",
    {
        u: string;
        v: string;
    } & Record<string | number, string | undefined>,
    Record<string, any>
>;
type JoinViaje = RouterContext<
    "/joinViaje",
    {
        u: string;
        v: string;
    } & Record<string | number, string | undefined>,
    Record<string, any>
>;
export const addUser = async (ctx: PostUserContext) => {
    const response = await ctx.request.body({ type: "json" })
    console.log(response)
    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.headers.set("Access-Control-Allow-Origin", "*")
    const value = await response.value

    if (!value.username || !value.password) {
        ctx.response.body = { msg: "faltan parametros, parametros necesarios: name,password" }
        ctx.response.status = 400
        console.log(ctx.response)
        return
    } else if (await UsersCollection.findOne({ username: value.username })) {
        ctx.response.body = { msg: "Ya existe un usuario con este nombre" }
        ctx.response.status = 400
        console.log(ctx.response)
        return
    } else {
        const newuser: User = {
            username: value.username,
            password: value.password,
        };
        await UsersCollection.insertOne(newuser as UserSchema)
        ctx.response.body = newuser;
        ctx.response.status = 200;
        console.log(ctx.response)
        return;
    }
}
export const addViaje = async (ctx: PostViajeContext) => {
    const response = await ctx.request.body({ type: "json" })
    ctx.response.headers.set("Access-Control-Allow-Origin", "*")
    const value = await response.value
    console.log("llega")
    console.log(value)
    let persona=value.personas;
    for (const element of persona) {
        const pv = await UsersCollection.findOne({ _id: new ObjectId(element.idP) })
        element.username = pv.username
        element.pagos=[]
        console.log("element")
        console.log(element)
    }

    let newviaje: Viaje = {
        name: value.name,
        personas:persona
    };
    console.log("viaje")
    console.log(newviaje)
    
    
    const v2=newviaje as ViajeSchema
    console.log("schema")
    console.log(v2)
    await ViajesCollection.insertOne(newviaje as ViajeSchema)
    ctx.response.body = newviaje;
    ctx.response.status = 200;
    return;

}
export const addTransaccion = async (context: AddBudget) => {
    console.log("llega")
    const response = await context.request.body({ type: "json" })
    context.response.headers.set("Access-Control-Allow-Origin", "*")
    const params = helpers.getQuery(context, { mergeParams: true });
    console.log(response)
    const value = await response.value
    if (!params?.u) {
        context.response.status = 400;
        context.response.body = { msg: "faltan parametros:user" }
        return
    } if (!params?.v) {
        context.response.status = 400;
        context.response.body = { msg: "faltan parametros:viaje" }
        return
    }
    const viaje: ViajeSchema | undefined = await ViajesCollection.findOne({
        _id: new ObjectId(params?.v),
    })
    if (viaje) {
        // Buscar la persona en el viaje por su id
        const personaEnViaje = viaje.personas.find(persona => persona.idP === params.u);

        if (personaEnViaje) {
            // Actualizar el presupuesto de la persona

            // Guardar los cambios en la base de datos
            await ViajesCollection.updateOne(
                { _id: new ObjectId(params?.v), "personas.idP": params?.u },
                { $push: { "personas.$.transacciones": value } }
            );

            context.response.status = 200;
            context.response.body = { message: "Transaccion creada correctamente" };
            console.log(context.response)
            return;
        } else {
            context.response.status = 400;
            context.response.body = { message: "Usuario no encontrado en el viaje" };
            console.log(context.response)
            return;
        }
    } else {
        context.response.status = 400;
        context.response.body = { message: "Viaje no encontrado" };
        console.log(context.response)
        return;
    }

}
export const addPago = async (context: AddPago) => {
    console.log("llega")
    const response = await context.request.body({ type: "json" })
    context.response.headers.set("Access-Control-Allow-Origin", "*")
    const params = helpers.getQuery(context, { mergeParams: true });
    console.log(response)
    const value = await response.value
    if (!params?.u) {
        context.response.status = 400;
        context.response.body = { msg: "faltan parametros:user" }
        return
    } if (!params?.v) {
        context.response.status = 400;
        context.response.body = { msg: "faltan parametros:viaje" }
        return
    }
    const viaje: ViajeSchema | undefined = await ViajesCollection.findOne({
        _id: new ObjectId(params?.v),
    })
    if (viaje) {
        // Buscar la persona en el viaje por su id
        const personaEnViaje = viaje.personas.find(persona => persona.idP === params.u);

        if (personaEnViaje) {
            // Actualizar el presupuesto de la persona

            // Guardar los cambios en la base de datos
            await ViajesCollection.updateOne(
                { _id: new ObjectId(params?.v), "personas.idP": params?.u },
                { $push: { "personas.$.pagos": value } }
            );

            context.response.status = 200;
            context.response.body = { message: "Pago creado correctamente" };
            console.log(context.response)
            return;
        } else {
            context.response.status = 400;
            context.response.body = { message: "Usuario no encontrado en el viaje" };
            console.log(context.response)
            return;
        }
    } else {
        context.response.status = 400;
        context.response.body = { message: "Viaje no encontrado" };
        console.log(context.response)
        return;
    }

}

export const joinViaje = async (context: JoinViaje) => {
    console.log("llega")
    context.response.headers.set("Access-Control-Allow-Origin", "*")
    const params = helpers.getQuery(context, { mergeParams: true });
    if (!params?.u) {
        context.response.status = 400;
        context.response.body = { msg: "faltan parametros:user" }
        return
    } if (!params?.v) {
        context.response.status = 400;
        context.response.body = { msg: "faltan parametros:viaje" }
        return
    }
    const viaje: ViajeSchema | undefined = await ViajesCollection.findOne({
        _id: new ObjectId(params?.v),
    })
    if (viaje) {
        // Buscar la persona en el viaje por su id
        const personaEnViaje = viaje.personas.find(persona => persona.idP === params.u);

        if (personaEnViaje) {
            context.response.status = 400;
            context.response.body = { message: "Usuario ya esta en el viaje" };
            
        } else {
            console.log(context.response)
            var persona=await UsersCollection.findOne({ _id: new ObjectId(params?.u) })
            console.log("persona")
            console.log(persona)
            
            // Actualizar el presupuesto de la persona
            const newPersona:PersonaViaje={
                username:persona.username,
                idP:params?.u,
                presupuesto:0,
                transacciones:[],
                pagos:[]
                
            }
            // Guardar los cambios en la base de datos
            await ViajesCollection.updateOne(
                { _id: new ObjectId(params?.v), },
                { $push: { "personas": newPersona } }
            );

            context.response.status = 200;
            context.response.body = { message: "Usuario añadido correctamente" };
            console.log(context.response)
            return;
        }
    } else {
        context.response.status = 400;
        context.response.body = { message: "Viaje no encontrado" };
        console.log(context.response)
        return;
    }

}