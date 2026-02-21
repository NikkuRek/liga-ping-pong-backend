import jwt from "jsonwebtoken"
import type { PlayerInterface } from "../interfaces"

const createToken = (player: PlayerInterface): Promise<string> => {
  const key = process.env.JWT_SECRET || "lpp_secret_key"
  return new Promise((resolve, reject) => {
    const payload = { ci: player.ci }
    jwt.sign(
      payload,
      key,
      {
        expiresIn: "1h",
      },
      (error, token) => {
        if (error) {
          console.log(error)
          reject("No se pudo generar el token")
        } else {
          resolve(token as string) //enviamos el token
        }
      },
    )
  })
}

const verifyToken = (token: string) => {
  const key = process.env.JWT_SECRET || "lpp_secret_key"
  let decoded: any = {}
  try {
    decoded = jwt.verify(token, key)
    console.log('Token verified successfully:', decoded)
  } catch (err) {
    console.log("error en la verificacion:", err)
  }
  return decoded
}

export { createToken, verifyToken }
