import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import { appError } from "../utils/error";

export function validate(schema: ObjectSchema) {
  return function (req: Request, res: Response, next: NextFunction) {
    const { error } = schema.validate(req.body);
    if (error) {
      throw appError(error.message, 400);
    }
    next();
  };
}
