import { Request, Response } from "express";
import { BadRequestError, respondWithJSON } from "./errorhandler.js";
import { db } from "../db/index.js";
import { chirps, NewChirp } from "../db/schema.js";


export async function postChirp(body: string, userId: string): Promise<NewChirp>{
    console.log("Creating new chirp");
    const [newChirp] = await db.insert(chirps).values({body: body, userId: userId}).returning();
    return newChirp;
}

export async function handlerValidateChirp(req: Request, res: Response): Promise<void>{
    type parameters = {
        body: string;
        userId: string;
    };
    let params: parameters = req.body;

    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);            
    }
    if (!params.userId){
        throw new BadRequestError("Invalid or no username");
    }
    const newChirp = await postChirp(cleanBody(params.body), params.userId);
    if (!newChirp){
        throw new BadRequestError("Something went wrong in creating chirp");
    }
    console.log(newChirp);
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