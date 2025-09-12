import type { Request, Response } from "express";
import { SetsServices } from "../services";

export class SetsController {
  constructor() {}

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await SetsServices.getAll();
    return res.status(status).json({
      message,
      data,
    });
  };

  one = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await SetsServices.getOne(Number(id));
    return res.status(status).json({
      message,
      data,
    });
  };

  getByMatch = async (req: Request, res: Response) => {
    const { matchId } = req.params;
    const { status, message, data } = await SetsServices.getByMatch(Number(matchId));
    return res.status(status).json({
      message,
      data,
    });
  };

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await SetsServices.create(req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await SetsServices.update(Number(id), req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message } = await SetsServices.delete(Number(id));
    return res.status(status).json({
      message,
    });
  };
}
