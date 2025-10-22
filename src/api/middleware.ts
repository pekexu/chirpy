import express from "express";
import { Request, Response } from "express";


//type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export function middlewareLogResponses(req: Request, res: Response, next: Function) {
    res.on("finish", () => {
        const status = res.statusCode;
        if (status !== 200){
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${status}`);
        }
    })
    next();

}

