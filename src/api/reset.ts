import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export async function handlerReset(req: Request, res: Response): Promise<void>{
    config.api.fileserverHits = 0;
    res.set(
    "Content-Type", "text/plain; charset=utf-8"
    );
    res.send("Resetting stats...");
}