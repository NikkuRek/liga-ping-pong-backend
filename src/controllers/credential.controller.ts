import type { Request, Response } from "express"
import { CredentialServices } from "../services"
import { createToken } from "../helpers/jwt.helpers"

export class CredentialController {
  constructor() {}

  all = async (req: Request, res: Response) => {
    const { status, message, data } = await CredentialServices.getAll()
    return res.status(status).json({
      message,
      data,
    })
  }

  one = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message, data } = await CredentialServices.getOne(id)
    return res.status(status).json({
      message,
      data,
    })
  }

  byPlayerCI = async (req: Request, res: Response) => {
    const { player_ci } = req.params
    const { status, message, data } = await CredentialServices.getByPlayerCI(player_ci)
    return res.status(status).json({
      message,
      data,
    })
  }

  create = async (req: Request, res: Response) => {
    const { status, message, data } = await CredentialServices.create(req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  update = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message, data } = await CredentialServices.update(id, req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  updateByPlayerCI = async (req: Request, res: Response) => {
    const { player_ci } = req.body
    const { status, message, data } = await CredentialServices.updateByPlayerCI(player_ci, req.body)
    return res.status(status).json({
      message,
      data,
    })
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status, message } = await CredentialServices.delete(id)
    return res.status(status).json({
      message,
    })
  }

  authenticate = async (req: Request, res: Response) => {
    const { player_ci, password } = req.body
    const { status, message, data } = await CredentialServices.authenticate(player_ci, password)
    if (status === 200 && data) {
      try {
        const token = await createToken(data.player)
        
        // Establecer el token en una cookie HttpOnly
        res.cookie('token', token, {
          httpOnly: true,
          secure: true, // Siempre true para permitir SameSite: 'none'
          sameSite: 'none', // Permite cookies en peticiones cross-origin
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
        })

        return res.status(status).json({
          message,
          user: data.player,
        })
      } catch (error) {
        return res.status(500).json({
          message: "Error al generar el token",
        })
      }
    }
    return res.status(status).json({
      message,
      data,
    })
  }

  logout = async (req: Request, res: Response) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    return res.status(200).json({
      message: "Sesión cerrada correctamente"
    });
  }

  patch = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, message } = await CredentialServices.patch(Number(id), req.body);
    return res.status(status).json({
      message,
    });
  };
}
