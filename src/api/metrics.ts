import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export async function handlerMetricsInc(req: Request, res: Response, next: NextFunction): Promise<void>{
    res.set(
    "Content-Type", "text/plain; charset=utf-8"
  );
  res.send(`Hits: ${config.fileserverHits}`);
}