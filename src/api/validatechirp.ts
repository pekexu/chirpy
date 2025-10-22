import { NextFunction, Request, Response } from "express";



export async function handlerValidateChirp(req: Request, res: Response): Promise<void>{
    type parameters = {
        body: string;
    };
    let body = "";

    req.on("data", (chunk) => {
        body += chunk;
    });
    let params: parameters;

    req.on("end", () => {
        try {
            params = JSON.parse(body);
        } catch (e) {
            respondWithError(res, 400, "Invalid JSON");
            return;
        }
        const maxChirpLength = 140;
            if (params.body.length > maxChirpLength) {
                respondWithError(res, 400, "Chirp is too long");
                return;
            }
            
            respondWithJSON(res, 200, { valid: true,});
     
         
    });
}

export function respondWithError(res: Response, code: number, message: string) {
  respondWithJSON(res, code, { error: message });
}

export function respondWithJSON(res: Response, code: number, payload: any) {
  res.header("Content-Type", "application/json");
  const body = JSON.stringify(payload);
  res.status(code).send(body);
}