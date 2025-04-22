import type { Request, Response } from "express"
import { PlayerServices } from "../services"

export class PlayerController {
  constructor() { }

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await PlayerServices.getAll()
    return res.status(status).json({
      message,
      data,
    })
  }

  one = async (req: Request, res: Response) => {
    const { CI } = req.params
    const { status, message, data } = await PlayerServices.getOne((CI))
    return res.status(status).json({
      message,
      data,
    })
  }

  active = async (req: Request, res: Response) => {
    const { status, message, data } = await PlayerServices.getActive()
    return res.status(status).json({
      message,
      data,
    })
  }

  inactive = async (req: Request, res: Response) => {
    const { status, message, data } = await PlayerServices.getInactive()
    return res.status(status).json({
      message,
      data,
    })
  }

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await PlayerServices.create(req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  update = async (req: Request, res: Response) => {
    const playerCIOriginal: string = req.params.CI;
    const updateData = req.body;
    const { status, message, data } = await PlayerServices.update(playerCIOriginal, updateData);

    return res.status(status).json({
      message,
      data,
    })
  }

  // update = async (req: Request, res: Response) => {
  //   const playerCIFromParams: string = req.params.CI; 
  //   const { CI, ...dataWithoutCI } = req.body;
  //   const { status, message, data } = await PlayerServices.update(playerCIFromParams, dataWithoutCI);
  //   return res.status(status).json({
  //     message,
  //     data,
  //   });
  // }

  delete = async (req: Request, res: Response) => {
    const { CI } = req.params
    const { status, message } = await PlayerServices.delete((CI))
    return res.status(status).json({
      message,
    })
  }
  softDelete = async (req: Request, res: Response) => {
    const { CI } = req.params
    const { status, message } = await PlayerServices.softDelete((CI))
    return res.status(status).json({
      message,
    })
  }
}

// Exportación nombrada para resolver el error
