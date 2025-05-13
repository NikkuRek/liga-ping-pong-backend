import type { Request, Response } from "express";
import { TournamentServices } from "../services";

export class TournamentController {
  constructor() {}

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await TournamentServices.getAll();
    return res.status(status).json({
      message,
      data,
    });
  };

  one = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await TournamentServices.getOne(Number(id));
    return res.status(status).json({
      message,
      data,
    });
  };

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await TournamentServices.create(req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await TournamentServices.update(Number(id), req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message } = await TournamentServices.delete(Number(id));
    return res.status(status).json({
      message,
    });
  };
}
