import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";
import { BadRequestError, respondWithJSON, UnauthorizedError } from "./errorhandler.js";
import { Request, Response } from "express";
import { db } from "../db/index.js";
import {  RefreshToken, refreshTokens, users } from "../db/schema.js";
import { eq,  } from "drizzle-orm";
import { config } from "../config.js";
import { randomBytes } from "crypto";

const TOKEN_ISSUER = "chirpy";

export function makeRefreshToken(){
  return randomBytes(32).toString('hex');
}


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
    expiresInSeconds: number;
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

  const refresh = await createRefreshToken(user.id);

  params.expiresInSeconds = 60*60;
  const jwtToken = makeJWT(user.id, params.expiresInSeconds, config.secret)

  const userRes = {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    token: jwtToken,
    refreshToken: refresh.token
  };
  respondWithJSON(res, 200, userRes);
}

async function createRefreshToken(user: string): Promise<RefreshToken>{
  // access token:
  // second, minutes, hours, days
  // 60 * 60 * 24 * 60
  let expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + 60 * 60 * 24 * 60);

  const refreshToken: RefreshToken = {
    userId: user,
    token: makeRefreshToken(),
    expiresAt: expiryDate,
    revokedAt: null,
  }
  const [refresh] = await db.insert(refreshTokens).values(refreshToken).returning();
  if (!refresh){
    throw new BadRequestError("Something went wrong when creating refresh token");
  }
  return refresh;
}

export async function handlerRefresh(req: Request, res: Response){
  
  const token = getBearerToken(req); // requestissa tuleva token
  const dateNow = new Date();
  const [dbToken] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));

  if (!dbToken){
    throw new UnauthorizedError("Invalid token");
  } else if (dbToken.expiresAt < dateNow){
    throw new UnauthorizedError("Token has expired");
  } else if (dbToken.revokedAt !== null){
    throw new UnauthorizedError("Token has been revoked");
  } 

  const jwt = makeJWT(dbToken.userId, 60*60, config.secret);
  respondWithJSON(res, 200, {"token": jwt});
}

export async function handlerRevoke(req: Request, res: Response){
  const token = getBearerToken(req);

  const [dbToken] = await db.update(refreshTokens).set({revokedAt: new Date()}).where(eq(refreshTokens.token, token));
  respondWithJSON(res, 204, {});
}