import jwt from "jsonwebtoken"
import type { PlayerInterface } from "../interfaces"

/**
 * Genera un token JWT para un jugador.
 * @param player Objeto del jugador que contiene al menos el CI.
 * @returns Promesa que resuelve en un string (el token).
 */
const createToken = (player: PlayerInterface): Promise<string> => {
  // Se obtiene la clave secreta priorizando variables de entorno para mayor seguridad
  const key = process.env.JWT_SECRET || process.env.PRIVATE_KEY || "lpp_secret_key"
  
  return new Promise((resolve, reject) => {
    // Definimos el payload: qué información viajará dentro del token
    const payload = { ci: player.ci }
    
    // Firmamos el token con el payload, la clave y una expiración de 1 hora
    jwt.sign(
      payload,
      key,
      {
        expiresIn: "7d",
      },
      (error, token) => {
        if (error) {
          console.log(error)
          reject("No se pudo generar el token")
        } else {
          // Si no hay error, enviamos el token generado
          resolve(token as string)
        }
      },
    )
  })
}

/**
 * Verifica la validez de un token JWT.
 * @param token El string del token a verificar.
 * @returns El payload decodificado si es válido, o null si falla.
 */
const verifyToken = (token: string) => {
  const key = process.env.JWT_SECRET || process.env.PRIVATE_KEY || "lpp_secret_key"
  try {
    // Si la verificación es exitosa, retorna el contenido del JSON (ci, iat, exp)
    return jwt.verify(token, key)
  } catch (err) {
    // Si el token expiró o la firma es inválida, capturamos el error y retornamos null
    console.log("Error en la verificación del token:", (err as any).message)
    return null
  }
}

export { createToken, verifyToken }
