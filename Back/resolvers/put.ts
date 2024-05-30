import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { ViajeSchema } from "../db/schemas.ts";
import { ViajesCollection } from "../db/mongo.ts";
import { helpers } from "https://deno.land/x/oak@v11.1.0/mod.ts";

type PutBudget = RouterContext<
  "/updateBudget",
  {
    user: string;
    viaje: string;
    budget: number;
  } & Record<string | number, string | undefined>,
  Record<string, any>
>;

export const updateBudget = async (context: PutBudget) => {
  context.response.headers.set("Content-Type", "application/json");
  context.response.headers.set("Access-Control-Allow-Origin", "*")
  const params = helpers.getQuery(context, { mergeParams: true });
  if (!params?.user) {
    context.response.status = 400;
    context.response.body = { msg: "faltan parametros:user" }
    return
  } if (!params?.viaje) {
    context.response.status = 400;
    context.response.body = { msg: "faltan parametros:viaje" }
    return
  } if (!params?.budget) {
    context.response.status = 400;
    context.response.body = { msg: "faltan parametros:budget" }
    return
  }
  const viaje: ViajeSchema | undefined = await ViajesCollection.findOne({
    _id: new ObjectId(params?.viaje),
  })
  if (viaje) {
    // Buscar la persona en el viaje por su id
    const personaEnViaje = viaje.personas.find(persona => persona.idP === params.user);

    if (personaEnViaje) {
      // Actualizar el presupuesto de la persona
      personaEnViaje.presupuesto = params.budget;

      // Guardar los cambios en la base de datos
      await ViajesCollection.updateOne(
        { _id: viaje._id },
        { $set: { personas: viaje.personas } }
      );

      context.response.status = 200;
      context.response.body = { message: "Presupuesto actualizado correctamente" };
      return;
    } else {
      context.response.status = 400;
      context.response.body = { message: "Usuario no encontrado en el viaje" };
      return;
    }
  } else {
    context.response.status = 400;
    context.response.body = { message: "Viaje no encontrado" };
    return;
  }
}
