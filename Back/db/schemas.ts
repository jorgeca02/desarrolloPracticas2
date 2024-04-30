import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { User, Book, Author } from "../types.ts";

export type UserSchema = Omit<User, "id"> & {
  _id: ObjectId;                            
};  
export type ViajeSchema = Omit<Viaje, "id" | "personas"> & {
  _id: ObjectId;
  personas: Omit<PersonaViaje, "saldo"| "gasto">[]; 
};