import { Request, Response } from "express";
import { db } from "../index.js";
import { NewUser, UserResponse, users } from "../schema.js";
import { BadRequestError, NotFoundError, respondWithJSON } from "../../api/errorhandler.js";
import { hashPassword } from "../../api/auth.js";
import { eq } from "drizzle-orm";

async function createUser(user: NewUser) {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function handlerUpgradeUser(req: Request, res: Response){
    type parameters = {
    event: string;
    data: {
      userId: string;
    };
  };
  const params: parameters = req.body;
  
  if (params.event !== "user.upgraded"){
    respondWithJSON(res, 204, {});
    return;
  }
  const user = upgradeUser(params.data.userId);
  
  if (!user){
    throw new NotFoundError("Invalid user");
  }
  respondWithJSON(res, 204, {});

}

async function upgradeUser(userId: string){
  const [user] = await db.update(users).set({isChirpyRed: true}).where(eq(users.id, userId)).returning();
  if (!user){
    throw new NotFoundError("Invalid username");
  }

  return user;
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
    email: user.email,
    isChirpyRed: user.isChirpyRed
  };

  respondWithJSON(res, 201, userRes);
}