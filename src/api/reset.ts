import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export async function handlerReset(req: Request, res: Response, next: NextFunction): Promise<void>{
    config.fileserverHits = 0;
    res.set(
    "Content-Type", "text/plain; charset=utf-8"
    );
    res.send("Resetting stats...");
}