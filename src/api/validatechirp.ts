import { NextFunction, Request, Response } from "express";
import { BadRequestError, respondWithJSON } from "./errorhandler.js";



export async function handlerValidateChirp(req: Request, res: Response): Promise<void>{
    type parameters = {
        body: string;
    };

    let params: parameters = req.body;

        const maxChirpLength = 140;
        if (params.body.length > maxChirpLength) {
            throw new BadRequestError(`Chirp is too long. Max length is ${maxChirpLength}`);
            
        }
        respondWithJSON(res, 200, { cleanedBody: cleanBody(params.body),});
    
}


export function cleanBody(body: string): string{
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