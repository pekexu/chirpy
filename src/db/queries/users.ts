import { Request, Response } from "express";
import { db } from "../index.js";
import { NewUser, UserResponse, users } from "../schema.js";
import { BadRequestError, respondWithJSON } from "../../api/errorhandler.js";
import { hashPassword } from "../../api/auth.js";

async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function handlerCreateUser(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };

  const params: parameters = req.body;
  
  if (!params.email || !params.password) {
    throw new BadRequestError("Invalid email or password");
  }
  const passwordHash = await hashPassword(params.password);
  if (!passwordHash) {
    throw new  BadRequestError("Invalid password");
  }
  const user = await createUser({ password: passwordHash, email: params.email });

  if (!user) {
    throw new Error("Could not create user");
  }
 

  const userRes: UserResponse = {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email
  };

  respondWithJSON(res, 201, userRes);
}