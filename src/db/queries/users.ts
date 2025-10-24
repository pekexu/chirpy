import { Request, Response } from "express";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { BadRequestError, respondWithJSON } from "../../api/errorhandler.js";

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
    email: string;
  };
  const params: parameters = req.body;

  if (!params.email) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await createUser({ email: params.email });

  if (!user) {
    throw new Error("Could not create user");
  }
  respondWithJSON(res, 201, user);
}