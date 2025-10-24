import { Request, Response } from "express";
import { config } from "../config.js";
import { ForbiddenError } from "./errorhandler.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

export async function handlerReset(req: Request, res: Response): Promise<void>{
    if (config.api.platform !== "dev"){
        throw new ForbiddenError("Forbidden");
    }
    await db.delete(users);
    config.api.fileserverHits = 0;
    res.set(
    "Content-Type", "text/plain; charset=utf-8"
    );
    res.send("Resetting stats...");
}