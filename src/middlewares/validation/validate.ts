import { ErrorHandler } from "../../errors/errorHandler";
import { Request, Response, NextFunction } from "express";
import Joi, { ObjectSchema } from "joi";

const validate = (schema: ObjectSchema<any>, typeSchema = "body") => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {

      let validated;
      if(typeSchema === "body"){
        validated = await schema.validateAsync(req[typeSchema]);
        req[typeSchema]= validated;
      }

      next();
    } catch (err: unknown) {
       next(new ErrorHandler((err as Error).message, 400));
    }
  };
};

export {validate}