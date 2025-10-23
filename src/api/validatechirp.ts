import { NextFunction, Request, Response } from "express";



export async function handlerValidateChirp(req: Request, res: Response): Promise<void>{
    type parameters = {
        body: string;
    };

    let params: parameters = req.body;

        const maxChirpLength = 140;
        if (params.body.length > maxChirpLength) {
            respondWithError(res, 400, "Chirp is too long");
            return;
        }
        respondWithJSON(res, 200, { cleanedBody: cleanBody(params.body),});
    
}

export function respondWithError(res: Response, code: number, message: string) {
  respondWithJSON(res, code, { error: message });
}

export function respondWithJSON(res: Response, code: number, payload: any) {
  res.header("Content-Type", "application/json");
  const body = JSON.stringify(payload);
  res.status(code).send(body);
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