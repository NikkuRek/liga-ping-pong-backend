import type { NextFunction, Request, Response } from "express"
import { verifyToken } from "../helpers/jwt.helpers"
import { PlayerServices } from "../services"

export const validateToken = async (req: Request | any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  console.log('Auth header:', authHeader)  // Debug
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Token requerido" })
  }
  const token = authHeader.substring(7)
  console.log('Token:', token)  // Debug
  const decoded: any = verifyToken(token)
  console.log('Decoded:', decoded)  // Debug
  if (!decoded || !decoded.ci) {
    return res.status(401).json({ message: "Token inválido" })
  }
  const { data, message, status } = await PlayerServices.getOne(decoded.ci)
  if (status === 500) {
    return res.status(status).json({ message, data })
  } else if (status === 404) {
    return res.status(404).json({ message: "Jugador no encontrado" })
  } else {
    req.player = data
    if ((data as any).status === false) {
      return res.status(401).json({ message: "Jugador deshabilitado" })
    }
    next()
  }
}
