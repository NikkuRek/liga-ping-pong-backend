import type { Request, Response } from "express";
import { TeamInscriptionServices } from "../services";

export class TeamInscriptionController {
  constructor() {}

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await TeamInscriptionServices.getAll();
    return res.status(status).json({
      message,
      data,
    });
  };

  one = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await TeamInscriptionServices.getOne(Number(id));
    return res.status(status).json({
      message,
      data,
    });
  };

  getByTournament = async (req: Request, res: Response) => {
    const { tournamentId } = req.params;
    const { status, message, data } = await TeamInscriptionServices.getByTournament(Number(tournamentId));
    return res.status(status).json({
      message,
      data,
    });
  };

  getByTeam = async (req: Request, res: Response) => {
    const { teamId } = req.params;
    const { status, message, data } = await TeamInscriptionServices.getByTeam(Number(teamId));
    return res.status(status).json({
      message,
      data,
    });
  };

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await TeamInscriptionServices.create(req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await TeamInscriptionServices.update(Number(id), req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message } = await TeamInscriptionServices.delete(Number(id));
    return res.status(status).json({
      message,
    });
  };
}
