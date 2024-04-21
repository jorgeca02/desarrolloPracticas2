import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { User, Book, Author } from "../types.ts";

export type UserSchema = Omit<User, "id"> & {
  _id: ObjectId;                            
};       