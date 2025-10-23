
import { NextFunction, Request, Response } from "express";


export function respondWithError(res: Response, code: number, message: string) {
  respondWithJSON(res, code, { error: message });
}

export function respondWithJSON(res: Response, code: number, payload: any) {
  res.header("Content-Type", "application/json");
  const body = JSON.stringify(payload);
  res.status(code).send(body);
}


export class BadRequestError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class UnauthorizedError extends Error {
    constructor(message: string){
        super(message);
    }
}

export class ForbiddenError extends Error {
    constructor(message: string){
        super(message);
    }
}
export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export function errorMiddleware(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction,
    ) {
        let statusCode = 500;
        let message = "Something went wrong on our end";
    if (err instanceof BadRequestError){
        statusCode = 400;
        message = err.message;
    } else if (err instanceof UnauthorizedError) {
        statusCode = 401;
        message = err.message;
    } else if (err instanceof ForbiddenError) {
        statusCode = 403;
        message = err.message; 
    } else if (err instanceof NotFoundError) {
        statusCode = 404;
        message = err.message;
    } else {
        console.log("500 - Internal Server Error");
    }
    respondWithError(res, statusCode, message);
}