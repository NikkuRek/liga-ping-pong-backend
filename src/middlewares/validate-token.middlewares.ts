import type { NextFunction, Request, Response } from "express"
import { verifyToken } from "../helpers/jwt.helpers"
import { PlayerServices } from "../services"
import type { PlayerInterface } from "../interfaces"

// Definimos una interfaz personalizada para que la Request de Express reconozca la propiedad 'player'
interface CustomRequest extends Request {
  player?: PlayerInterface
}

/**
 * Middleware para validar el JWT en los headers de la petición.
 * Se encarga de permitir o denegar el acceso a las rutas protegidas.
 */
export const validateToken = async (req: CustomRequest, res: Response, next: NextFunction) => {
  // Intentar obtener el token de la cookie primero
  let token = req.cookies?.token

  // Si no hay cookie, intentar obtener del header Authorization
  if (!token) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
  }
  
  // Si no hay token en ningún lado, denegar acceso
  if (!token) {
    return res.status(401).json({ message: "Token requerido" })
  }
  
  // Verificamos la firma y expiración del token usando el helper
  const decoded: any = verifyToken(token)
  
  // Si el token es nulo o no tiene el CI del jugador, se deniega el acceso
  if (!decoded || !decoded.ci) {
    return res.status(401).json({ message: "Token inválido o expirado" })
  }

  // Verificación adicional contra la base de datos para asegurar que el usuario existe y está activo
  const { data, message, status } = await PlayerServices.getOne(decoded.ci)
  
  if (status === 500) {
    return res.status(status).json({ message, data })
  } else if (status === 404) {
    return res.status(404).json({ message: "Jugador no encontrado" })
  } else {
    // Si todo está bien, inyectamos los datos del jugador en la petición
    req.player = data as any
    
    // Verificamos además si el jugador no ha sido deshabilitado manualmente
    if ((data as any).status === false) {
      return res.status(401).json({ message: "Jugador deshabilitado" })
    }
    
    // Continuamos a la siguiente función o controlador
    next()
  }
}
