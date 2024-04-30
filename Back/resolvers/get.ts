import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { ViajesCollection, UsersCollection } from "../db/mongo.ts";
import { ViajeSchema, UserSchema } from "../db/schemas.ts";
import { helpers } from "https://deno.land/x/oak@v11.1.0/mod.ts";

type LoginContext = RouterContext<
  "/Login",
  {
    user: string;
    pw:string
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
  context.response.headers.set("Access-Control-Allow-Origin","*")
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
      if(user.password!=params?.pw){
        context.response.status = 400;
        context.response.body = {"msg":"contraseña incorrecta"}
        console.log(context.response)
        return
      }
      context.response.status = 200;
      context.response.body = user
      console.log(context.response)
      return;
    }else{
      context.response.status = 404;
      context.response.body={"msg":"Usuario no encontrado"}
      console.log(context.response)
      return
    }
  }
}
export const getViaje = async (context: GetViajeContext) => {
  context.response.headers.set("Content-Type", "application/json");
  const params = helpers.getQuery(context, { mergeParams: true });
  if(!params?.id){
    context.response.status = 400;
    context.response.body = {msg: "faltan parametros:id"}
    return
  }else{  
    const viajeBd: ViajeSchema|undefined = await ViajesCollection.findOne({
        _id:new ObjectId(params?.id)
      }) 
      console.log(viajeBd);
    if(viajeBd){
      let viaje:Viaje=viajeBd
      viaje.personas.forEach(personaViaje => {
        let saldo=0
        let gasto=0
        personaViaje.transacciones.forEach(element => {
          gasto+=element.cantidad
          element.pagan.forEach(element=>{
            saldo+=element.cantidad
          })
        });
        viaje.personas.forEach(personaViaje2 => {
            if(personaViaje2.username==personaViaje.username)
              return
            personaViaje2.transacciones.forEach(element => {
              element.pagan.forEach(element=>{
                console.log(element)
                if(element.username==personaViaje.username)
                  saldo-=element.cantidad
              })
            });
          });
        personaViaje.saldo=saldo
        personaViaje.gasto=gasto-saldo
      });
      context.response.status = 200;
      context.response.body = viaje
      return;
    }else{
      context.response.status = 404;
      context.response.body={"msg":"Viaje no encontrado"}
      return
    }
  }
}
