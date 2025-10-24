import express, { NextFunction } from "express";
import { Request, Response } from "express";
import { config } from "../config.js";

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        const status = res.statusCode;
        if (status >= 300){
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${status}`);
        }
    })
    next();
}

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction){
    config.api.fileserverHits++;
    next();
}