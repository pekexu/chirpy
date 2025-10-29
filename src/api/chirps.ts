import { Request, Response } from "express";
import { BadRequestError, ForbiddenError, NotFoundError, respondWithJSON, UnauthorizedError } from "./errorhandler.js";
import { db } from "../db/index.js";
import { chirps, NewChirp, users } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import { getBearerToken, validateJWT } from "./auth.js";
import { config } from "../config.js";

export async function handlerDeleteChirp(req: Request, res: Response){
    const token = getBearerToken(req);
    const userId = validateJWT(token, config.secret);
    const chirpId = getChirpId(req);
    
    const [chirp] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
    if (!chirp) {
        throw new NotFoundError("Chirp not found");
    }
    if (chirp.userId !== userId){
        throw new ForbiddenError("Invalid user");
    }
    const [deletedChirp] = await db.delete(chirps).where(and(eq(chirps.id, chirpId), eq(chirps.userId, userId))).returning();
    if (deletedChirp){
        respondWithJSON(res, 204, {});
    }
}



export async function handlerGetAllChirps(req: Request, res: Response): Promise<void>{
    const allChirps = await db.select().from(chirps).orderBy(chirps.createdAt);
    respondWithJSON(res, 200, allChirps);
}

export function getChirpId(req: Request): string {
    const chirpId = req.params.chirpID;
    if (!chirpId){
        throw new BadRequestError("Invalid Chirp ID");
    }
    return chirpId;
}

export async function handlerGetChirps(req: Request, res: Response): Promise<void>{
    const chirpId = getChirpId(req);
    const [aChirp] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
    if (!aChirp){
        throw new NotFoundError("Unable to find chirp");
    }
    respondWithJSON(res, 200, aChirp);
}


export async function postChirp(body: string, userId: string): Promise<NewChirp>{
    
    const [newChirp] = await db.insert(chirps).values({body: body, userId: userId}).returning();
    return newChirp;
}

export async function handlerValidateChirp(req: Request, res: Response): Promise<void>{
    type parameters = {
        body: string;
        userId: string;
    };
    let params: parameters = req.body;
    const token = getBearerToken(req);

    const validUser = validateJWT(token, config.secret);
    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);            
    }
    if (!validUser){
        throw new BadRequestError("Invalid or no username");
    }
    const newChirp = await postChirp(cleanBody(params.body), validUser);
    if (!newChirp){
        throw new BadRequestError("Something went wrong in creating chirp");
    }
    
    respondWithJSON(res, 201, newChirp);
}


function cleanBody(body: string): string{
    const badwords = ["kerfuffle", "sharbert", "fornax"];
    for (const word of badwords){
        if (body.toLowerCase().includes(word)){
            body = cleanHelp(body, word);
        }
    }
    return body;
}

function cleanHelp(body: string, word: string): string{
    const array = body.split(" ");
    for (let i = 0; i < array.length; i++){
        if(array[i].toLowerCase() === word){
            array[i] = "****";
        }
    }
    return array.join(" ");
}