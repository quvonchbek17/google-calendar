import { NextFunction, Response, Request } from "express";
import { ErrorHandler } from "@errors";

export const errorHandler = (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
	res.status(err.status || 500).json({
        message: err.message || "Something went wrong!",
        success: false
    })
}