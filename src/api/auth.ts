import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { BadRequestError, respondWithJSON, UnauthorizedError } from "./errorhandler.js";
import { Request, Response } from "express";
import { db } from "../db/index.js";
import { UserResponse, users } from "../db/schema.js";
import { eq, param } from "drizzle-orm";
import { config } from "../config.js";


const TOKEN_ISSUER = "chirpy";

export function getBearerToken(req: Request): string {
  const tokenString = req.get("Authorization");

  if (!tokenString) {
    throw new UnauthorizedError("Invalid token string");
  }

  return tokenString.substring(7).trim();
}

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
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
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


export type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;


export function makeJWT(userID: string, expiresIn: number, secret: string): string{
  
    const load:payload = {
        iss: TOKEN_ISSUER,
        sub: userID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000)+expiresIn,
    }
    const signIn = jwt.sign(load, secret, {algorithm : "HS256"});
    return signIn;
}


export async function checkPasswordHash(password: string, hash: string): Promise<boolean>{
    try {
        if(await argon2.verify(hash,password)){
            return true;
        } else {
            return false;
        } 
    } catch (err) {
        return false;
    }
}

export async function handlerUserLogin(req: Request, res: Response){
  type parameters = {
    password: string;
    email: string;
    expiresInSeconds?: number;
  };
  const params: parameters = req.body;

  if(!params.email || !params.password){
    throw new UnauthorizedError("Invalid email or password");
  }

  const [user] = await db.select().from(users).where(eq(users.email, params.email));
  const rightPass = await checkPasswordHash(params.password, user.password);

  
  if (!rightPass){
    throw new UnauthorizedError("Invalid email or password");
  }
  if (!params.expiresInSeconds || params.expiresInSeconds > 60 * 60){
    params.expiresInSeconds = 60*60;
  } 
  const jwtToken = makeJWT(user.id, params.expiresInSeconds, config.secret)

  const userRes = {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token: jwtToken,
  };
  respondWithJSON(res, 200, userRes);
}

