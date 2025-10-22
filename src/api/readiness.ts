import { NextFunction, Request, Response } from "express";

export async function handlerReadiness(req: Request, res: Response): Promise<void>{
  res.set(
    "Content-Type", "text/plain; charset=utf-8"
  );
  res.send("OK");
  
}