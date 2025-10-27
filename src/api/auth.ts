import * as argon2 from "argon2";
import * as jwt from "jsonwebtoken";
import { BadRequestError, respondWithJSON, UnauthorizedError } from "./errorhandler.js";
import { Request, Response } from "express";
import { db } from "../db/index.js";
import { UserResponse, users } from "../db/schema.js";
import { eq } from "drizzle-orm";


const TOKEN_ISSUER = "chirpy";

export async function hashPassword(password: string): Promise<string>{
    try {     
        const hash = await argon2.hash(password);
        return hash;
    } catch (err) {
        throw new BadRequestError("Unable to hash password");
    }
}

export function validateJWT(tokenString: string, secret: string): string {
  let decoded: payload;

  try {
    decoded = jwt.verify(tokenString, secret) as jwt.JwtPayload;
  } catch  (e) {
    throw new UnauthorizedError("Invalid token");
  }
  if (decoded.iss !== TOKEN_ISSUER) {
    throw new UnauthorizedError("Invalid issuer");
  }
  if (!decoded.sub) {
    throw new UnauthorizedError("No user ID in token");
  }
  return decoded.sub;
}


export type payload = Pick<jwt.JwtPayload, "iss" | "sub" | "iat" | "exp">;


export function makeJWT(userID: string, expiresIn: number, secret: string): string{
    const load:payload = {
        iss: TOKEN_ISSUER,
        sub: userID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000)+expiresIn,
    }
    const signIn = jwt.sign(load, secret);
    return signIn;
}


export async function checkPasswordHash(password: string, hash: string): Promise<boolean>{
    try {
        if(await argon2.verify(hash,password)){
            return true;
        } else {
            throw new UnauthorizedError("Incorrect email or password");
        } 
    } catch (err) {
        throw new UnauthorizedError("Incorrect email or password");
    }
}

export async function handlerUserLogin(req: Request, res: Response){
  type parameters = {
    password: string;
    email: string;
  };
  const params: parameters = req.body;

  if(!params.email || !params.password){
    throw new UnauthorizedError("Invalid email or password");
  }
  const [user] = await db.select().from(users).where(eq(users.email, params.email));
  const wrongPass = await checkPasswordHash(params.password, user.password);
  if (!wrongPass){
    throw new UnauthorizedError("Invalid email or password");
  }
  const userRes:UserResponse = {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email
  }
  respondWithJSON(res, 200, userRes);
}

