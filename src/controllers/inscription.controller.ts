import type { Request, Response } from "express";
import { InscriptionServices } from "../services";

export class InscriptionController {
  constructor() {}

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await InscriptionServices.getAll();
    return res.status(status).json({
      message,
      data,
    });
  };

  one = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await InscriptionServices.getOne(Number(id));
    return res.status(status).json({
      message,
      data,
    });
  };

  getByTournament = async (req: Request, res: Response) => {
    const { tournamentId } = req.params;
    const { status, message, data } = await InscriptionServices.getByTournament(Number(tournamentId));
    return res.status(status).json({
      message,
      data,
    });
  };

  getByPlayer = async (req: Request, res: Response) => {
    const { ci } = req.params;
    const { status, message, data } = await InscriptionServices.getByPlayer(ci);
    return res.status(status).json({
      message,
      data,
    });
  };
  
  getByTeam = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { status, message, data } = await InscriptionServices.getByTeam(Number(teamId));
    return res.status(status).json({
      message,
      data,
    });
  };

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await InscriptionServices.create(req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await InscriptionServices.update(Number(id), req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message } = await InscriptionServices.delete(Number(id));
    return res.status(status).json({
      message,
    });
  };

  patch = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await InscriptionServices.patch(Number(id), req.body);
    return res.status(status).json({
      message,
      data,
    });
  };
}
