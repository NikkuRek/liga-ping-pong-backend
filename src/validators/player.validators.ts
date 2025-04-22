import { check } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { PlayerDB } from "../config/sequelize.config"

export class PlayerValidator {
  validatePlayer = [

    check("CI", "El CI es obligatorio").not().isEmpty(),
    check("CI", "El CI debe contener solo números").isNumeric(),
    check("first_name", "El primer nombre es obligatorio").not().isEmpty(),
    check("first_name", "El primer nombre debe contener solo letras y letras con acentos").isString().matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
    check("last_name", "El apellido es obligatorio").not().isEmpty(),
    check("last_name", "El apellido debe contener solo letras y letras con acentos").isString().matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),
    check("phone", "El teléfono es obligatorio").not().isEmpty(),
    check("phone", "El teléfono debe contener solo números").isNumeric(),
    check("semester", "El semestre es obligatorio").not().isEmpty(),
    check("semester", "El semestre debe ser un número entero").isInt(),
    check("id_career", "El id de la carrera es obligatorio").not().isEmpty(),
    check("id_career", "El id de la carrera debe ser un número").isNumeric(),
    check("id_tier", "El id del nivel es obligatorio").not().isEmpty(),
    check("id_tier", "El id del nivel debe ser un número").isNumeric(),
    check("status", "El estado debe ser un valor booleano").optional().isBoolean(),
  ]
  validateIfCIExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ciFromBody = req.body.CI;
      const ciFromParams = req.params.CI; 

      if (ciFromBody === undefined || ciFromBody === null || ciFromBody === '') {
          return next();
      }

      if (ciFromBody === ciFromParams) {
          return next();
      }

      const playerWithBodyCI = await PlayerDB.findOne({ where: { CI: ciFromBody } });

      if (playerWithBodyCI) {
           return res.status(400).json({
             message: `La CI "${ciFromBody}" ya está registrado por otro jugador.`,
           });
      }
      next();
    } catch (error) {
      console.error("Error en validateIfCIExist:", error); 
      return res.status(500).json({
        message: "Error interno del servidor al validar CI",
      });
    }
  }

  validateIfPhoneIsUse = async (req: Request, res: Response, next: NextFunction) => {
    const { phone, CI } = req.body
    const player = await PlayerDB.findOne({ where: { phone } })
    if (player && player.getDataValue("CI").toString() !== CI) {
      return res.status(400).json({
        message: "El teléfono ya está en uso",
      })
    }
    next()
  }
}

export const playerValidator = new PlayerValidator()