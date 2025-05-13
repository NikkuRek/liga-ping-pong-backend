import type { Request, Response } from "express";
import { TournamentPlayerStatsServices } from "../services";

export class TournamentPlayerStatsController {
  constructor() {}

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await TournamentPlayerStatsServices.getAll();
    return res.status(status).json({
      message,
      data,
    });
  };

  one = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await TournamentPlayerStatsServices.getByInscriptionId(Number(id));
    return res.status(status).json({
      message,
      data,
    });
  };

  getByTournament = async (req: Request, res: Response) => {
    const { tournamentId } = req.params;
    const { status, message, data } = await TournamentPlayerStatsServices.getByTournament(Number(tournamentId));
    return res.status(status).json({
      message,
      data,
    });
  };

  getByPlayer = async (req: Request, res: Response) => {
    const { CI } = req.params;
    const { status, message, data } = await TournamentPlayerStatsServices.getByPlayer(CI);
    return res.status(status).json({
      message,
      data,
    });
  };

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await TournamentPlayerStatsServices.create(req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await TournamentPlayerStatsServices.update(Number(id), req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message } = await TournamentPlayerStatsServices.delete(Number(id));
    return res.status(status).json({
      message,
    });
  };

  updateFromMatch = async (req: Request, res: Response) => {
    const { matchId } = req.params;
    const { status, message } = await TournamentPlayerStatsServices.updateFromMatch(Number(matchId));
    return res.status(status).json({
      message,
    });
  };
}
