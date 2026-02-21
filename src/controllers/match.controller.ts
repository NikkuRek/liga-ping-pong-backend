import type { Request, Response } from "express";
import { MatchServices, InscriptionServices } from "../services";

export class MatchController {
  constructor() {}

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await MatchServices.getAll();
    return res.status(status).json({
      message,
      data,
    });
  };

  one = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await MatchServices.getOne(Number(id));
    return res.status(status).json({
      message,
      data,
    });
  };

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await MatchServices.create(req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  propose = async (req: Request, res: Response) => {
    const playerCI = (req as any).player.ci
    const { status, message, data } = await MatchServices.propose(req.body);
    if (status === 201) {
      // Get opponent CI
      const match = data
      const opponentInscriptionId = (match as any).inscription1_id === req.body.inscription1_id ? (match as any).inscription2_id : (match as any).inscription1_id
      const opponentInscription = await InscriptionServices.getOne(opponentInscriptionId)
      if (opponentInscription.status === 200) {
        const opponentCI = (opponentInscription.data as any).player_ci
        // Emit to opponent
        const io = (global as any).io
        io.to(opponentCI).emit('matchProposed', { matchId: (match as any).match_id, proposerCI: playerCI })
      }
    }
    return res.status(status).json({
      message,
      data,
    });
  };

  update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message, data } = await MatchServices.update(Number(id), req.body);
    return res.status(status).json({
      message,
      data,
    });
  };

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message } = await MatchServices.delete(Number(id));
    return res.status(status).json({
      message,
    });
  };

  deleteCascade = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message } = await MatchServices.deleteCascade(Number(id));
    return res.status(status).json({
      message,
    });
  };

  getMatchesByPlayerCI = async (req: Request, res: Response) => {
    const { player_ci } = req.params;
    const { status, message, data } = await MatchServices.getMatchesByPlayerCI(player_ci);
    return res.status(status).json({
      message,
      data,
    });
  };

  getMatchesByCIInCurrentWeek = async (req: Request, res: Response) => {
    const { player_ci } = req.params;
    const { status, message, data } = await MatchServices.getMatchesByCIInCurrentWeek(player_ci);
    return res.status(status).json({
      message,
      data,
    });
  };

  getMatchesByPlayerName = async (req: Request, res: Response) => {
    const { first_name, last_name } = req.query;
    const { status, message, data } = await MatchServices.getMatchesByPlayerName(
      String(first_name),
      String(last_name)
    );
    return res.status(status).json({
      message,
      data,
    });
  }
}
