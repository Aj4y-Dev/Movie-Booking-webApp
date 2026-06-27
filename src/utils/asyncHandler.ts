import { Request, Response, NextFunction } from "express";

type AsyncController = (req: Request, res: Response) => Promise<void>;

const asyncHandler = (fn: AsyncController) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
};

export default asyncHandler;
