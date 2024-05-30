import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { ViajesCollection, UsersCollection } from "../db/mongo.ts";
import { ViajeSchema, UserSchema } from "../db/schemas.ts";
import { helpers } from "https://deno.land/x/oak@v11.1.0/mod.ts";

type LoginContext = RouterContext<
  "/Login",
  {
    user: string;
    pw: string
  } & Record<string | number, string | undefined>,
  Record<string, any>
>;
type GetViajeContext = RouterContext<
  "/getViaje",
  {
    id: string
  } & Record<string | number, string | undefined>,
  Record<string, any>
>;

export const login = async (context: LoginContext) => {
  context.response.headers.set("Content-Type", "application/json");
  context.response.headers.set("Access-Control-Allow-Origin", "*")
  const params = helpers.getQuery(context, { mergeParams: true });
  if (!params?.user) {
    context.response.status = 400;
    context.response.body = { msg: "faltan parametros:usuario" }
    return
  } if (!params?.pw) {
    context.response.status = 400;
    context.response.body = { msg: "faltan parametros:contraseña" }
    return
  } else {
    const user: UserSchema | undefined = await UsersCollection.findOne({
      username: params?.user
    })
    if (user) {
      if (user.password != params?.pw) {
        context.response.status = 400;
        context.response.body = { "msg": "contraseña incorrecta" }
        return
      }
      context.response.status = 200;
      context.response.body = user
      return;
    } else {
      context.response.status = 404;
      context.response.body = { "msg": "Usuario no encontrado" }
      return
    }
  }
}
export const getViaje = async (context: GetViajeContext) => {
  context.response.headers.set("Content-Type", "application/json");
  context.response.headers.set("Access-Control-Allow-Origin", "*");
  const params = helpers.getQuery(context, { mergeParams: true });
  if (!params?.id) {
    context.response.status = 400;
    context.response.body = { msg: "faltan parametros:id" }
    return
  } else {
    const viajeBd: ViajeSchema | undefined = await ViajesCollection.findOne({
      _id: new ObjectId(params?.id)
    })
    if (viajeBd) {
      let viaje: Viaje = viajeBd
      //calculo saldo y gasto
      viaje.personas.forEach(personaViaje => {
        let saldo = 0
        let gasto = 0
        personaViaje.transacciones.forEach(transaccion => {
          gasto += transaccion.cantidad
          transaccion.pagan.forEach(paga => {
            saldo += paga.cantidad
            gasto -= paga.cantidad
          })
        });
        personaViaje.pagos.forEach(pago => {
          saldo += pago.cantidad
        });
        viaje.personas.forEach(personaViaje2 => {
          if (personaViaje2.username != personaViaje.username) {
            personaViaje2.transacciones.forEach(transaccion => {
              transaccion.pagan.forEach(paga => {
                if (paga.username == personaViaje.username) {
                  saldo -= paga.cantidad
                  gasto += paga.cantidad
                }

              })
            });
            personaViaje2.pagos.forEach(pago => {
              if (pago.idP == personaViaje.idP) {
                saldo -= pago.cantidad
              }

            });

          }
        });
        personaViaje.saldo = saldo
        personaViaje.gasto = gasto
      });
      //calculo pendientes
      viaje.personas.forEach(personaViaje => {
        personaViaje.calculo = personaViaje.saldo
        personaViaje.pendientes = []
      })
      let count = 5;
      while (!viaje.personas.every(persona => persona.calculo == 0)) {
        const maxSaldoPersona = encontrarMaxSaldo(viaje.personas);
        const minSaldoPersona = encontrarMinSaldo(viaje.personas);
        let cantidadPagada: number
        if (Math.abs(maxSaldoPersona.calculo) > Math.abs(minSaldoPersona.calculo)) {
          minSaldoPersona.pendientes.push(
            {
              idP: maxSaldoPersona.idP,
              cantidad: Math.abs(minSaldoPersona.calculo)
            }
          )
          cantidadPagada = Math.abs(minSaldoPersona.calculo)
        }
        else {
          minSaldoPersona.pendientes.push(
            {
              idP: maxSaldoPersona.idP,
              cantidad: maxSaldoPersona.calculo
            }
          )
          cantidadPagada = maxSaldoPersona.calculo
        }
        minSaldoPersona.calculo += cantidadPagada
        maxSaldoPersona.calculo -= cantidadPagada
        if (count > 0) {
          console.log("----")
          console.log(cantidadPagada)
          console.log(minSaldoPersona)
          console.log(maxSaldoPersona)
          count--
        }
      }
      //añadir transacciones no propias
      
      //respuesta
      context.response.status = 200;
      context.response.body = viaje
      return;
    } else {
      context.response.status = 404;
      context.response.body = { "msg": "Viaje no encontrado" }
      return
    }
  }
}
export const getViajesPorPersona = async (context: GetViajesPersonaContext) => {
  context.response.headers.set("Content-Type", "application/json");
  context.response.headers.set("Access-Control-Allow-Origin", "*")
  const params = helpers.getQuery(context, { mergeParams: true });
  if (!params?.persona) {
    context.response.status = 400;
    context.response.body = { msg: "faltan parametros:persona" }
    return
  } else {
    const persona: UserSchema = await UsersCollection.findOne({
      _id: new ObjectId(params.persona)
    })
    const viajes: ViajeSchema[] = await ViajesCollection.find({
      "personas.username": persona.username,
    }).toArray();

    context.response.status = 200;
    context.response.body = viajes
    return;
  }
}
// Función para encontrar el elemento con el saldo máximo
function encontrarMaxSaldo(personas: PersonaViaje[]): PersonaViaje | undefined {
  return personas.reduce((maxSaldo, persona) =>
    (maxSaldo === undefined || persona.calculo > maxSaldo.calculo) ? persona : maxSaldo, undefined);
}

// Función para encontrar el elemento con el saldo mínimo
function encontrarMinSaldo(personas: PersonaViaje[]): PersonaViaje | undefined {
  return personas.reduce((minSaldo, persona) =>
    (minSaldo === undefined || persona.calculo < minSaldo.calculo) ? persona : minSaldo, undefined);
}
