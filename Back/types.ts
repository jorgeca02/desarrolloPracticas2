import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";

export type User = {
    id:string,
    username:string,
    pasword:string
}
export type Viaje = {
    id:string,
    name:string,
    personas:[PersonaViaje]
}
export type PersonaViaje = {
    username:string,
    saldo:number,
    gasto:number,
    presupuesto:number,
    transacciones:[Transaccion]
}
export type Transaccion = {
    cantidad:number,
    pagan:[{username:string,cantidad:numero}]
}
