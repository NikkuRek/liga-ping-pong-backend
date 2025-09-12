import { body } from "express-validator"
import { CredentialDB } from "../config/sequelize.config"

export class CredentialValidator {
  validateFields = [
    body("player_ci")
      .notEmpty()
      .withMessage("El CI del jugador es requerido")
      .isString()
      .withMessage("El CI debe ser una cadena de texto"),
    body("password")
      .notEmpty()
      .withMessage("La contraseña es requerida")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
  ]

  validatePlayerCIExists = body("player_ci").custom(async (value, { req }) => {
    if (req.method === "POST") {
      const credential = await CredentialDB.findOne({ where: { player_ci: value } })
      if (credential) {
        throw new Error("Ya existe una credencial para este jugador")
      }
    }
    return true
  })

  validateAuthFields = [
    body("player_ci").notEmpty().withMessage("El CI del jugador es requerido"),
    body("password").notEmpty().withMessage("La contraseña es requerida"),
  ]

  validateUpdateFields = [
    body("password").optional().isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  ]

  validateUpdateByPlayerCI = [
    body("player_ci")
      .notEmpty()
      .withMessage("El CI del jugador es requerido")
      .isString()
      .withMessage("El CI debe ser una cadena de texto"),
    body("password")
      .notEmpty()
      .withMessage("La contraseña es requerida")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
  ]
}

export const credentialValidators = new CredentialValidator()
