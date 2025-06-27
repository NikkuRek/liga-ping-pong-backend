import { check } from "express-validator"
import type { NextFunction, Request, Response } from "express"
import { PlayerDB } from "../config/sequelize.config"

export class PlayerValidator {
  validateFields = [
    check("playerData.ci", "El CI es obligatorio").not().isEmpty(),
    check("playerData.ci", "El CI debe contener solo números").isNumeric(),

    check("playerData.first_name", "El primer nombre es obligatorio").not().isEmpty(),
    check("playerData.first_name", "El primer nombre debe contener solo letras y letras con acentos")
      .isString()
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),

    check("playerData.last_name", "El apellido es obligatorio").not().isEmpty(),
    check("playerData.last_name", "El apellido debe contener solo letras y letras con acentos")
      .isString()
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/),

    check("playerData.phone", "El teléfono es obligatorio").not().isEmpty(),
    check("playerData.phone", "El teléfono debe contener solo números").isNumeric(),

    check("playerData.semester", "El semestre es obligatorio").not().isEmpty(),
    check("playerData.semester", "El semestre debe ser un número entero").isInt(),

    check("playerData.career_id", "El id de la carrera es obligatorio").not().isEmpty(),
    check("playerData.career_id", "El id de la carrera debe ser un número").isNumeric(),

    check("playerData.tier_id", "El id del nivel es obligatorio").not().isEmpty(),
    check("playerData.tier_id", "El id del nivel debe ser un número").isNumeric(),

    check("playerData.status", "El estado debe ser un valor booleano").optional().isBoolean(),

    check("playerData.available_days", "La disponibilidad debe ser un array de IDs de días").optional().isArray(),
    check("playerData.available_days.*", "Cada día en la disponibilidad debe ser un número entero válido")
      .optional()
      .isInt({ min: 1, max: 5 }),
  ]

  validateCIExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ciFromBody = req.body.playerData?.ci
      const ciFromParams = req.params.ci

      console.log('--- validateCIExists Debug ---');
      console.log('req.method:', req.method);
      console.log('ciFromBody:', ciFromBody, typeof ciFromBody);
      console.log('ciFromParams:', ciFromParams, typeof ciFromParams);

      if (!ciFromBody) {
        console.log('validateCIExists: ciFromBody es nulo o indefinido, continuando.');
        return next()
      }

      // Buscar si existe un jugador con ese CI (ciFromBody)
      const playerWithBodyCI = await PlayerDB.findOne({ where: { ci: ciFromBody } });
      console.log('validateCIExists: playerWithBodyCI encontrado (si existe):', playerWithBodyCI ? playerWithBodyCI.getDataValue("ci") : 'null');


      // Caso 1: No existe ningún jugador con la CI del body (ni siquiera el que estamos actualizando si la CI cambió)
      if (!playerWithBodyCI) {
        console.log('validateCIExists: No se encontró ningún jugador con la CI del body. Permitiendo.');
        return next()
      }

      // Caso 2: Se encontró un jugador con la CI del body. Necesitamos saber si es el MISMO jugador que estamos actualizando.
      // Esto aplica solo para PUT (actualización).
      if (req.method.toLowerCase() === "put") {
        console.log('validateCIExists: Es una petición PUT.');
        // Si la CI del cuerpo es el mismo que la CI en los parámetros (no se está cambiando la CI del jugador)
        if (ciFromBody === ciFromParams) {
          console.log('validateCIExists: ciFromBody y ciFromParams son iguales.');
          // Y el jugador encontrado es el mismo jugador que estamos intentando actualizar
          console.log('validateCIExists: Comparando playerWithBodyCI.ci con ciFromParams:', playerWithBodyCI.getDataValue("ci"), '===', ciFromParams);
          if (playerWithBodyCI.getDataValue("ci") === ciFromParams) {
            console.log('validateCIExists: El CI del body corresponde al mismo jugador. Permitiendo.');
            return next(); // Permitir la actualización del propio jugador
          } else {
            // Esto es una inconsistencia si ciFromBody === ciFromParams
            console.error('validateCIExists: Lógica inconsistente. El CI del jugador encontrado (playerWithBodyCI.ci) no coincide con ciFromParams, aunque ciFromBody === ciFromParams. Esto no debería ocurrir.');
            return res.status(500).json({
              message: "Error interno de validación de CI (inconsistencia lógica inesperada)."
            });
          }
        } else {
          // Si la CI del body es DIFERENTE del CI en los parámetros (el usuario está intentando cambiar la CI del jugador)
          // Y ya existe otro jugador con ese nuevo CI (playerWithBodyCI no es null)
          // Entonces, se está intentando cambiar la CI a uno que ya está en uso por OTRA persona.
          console.log('validateCIExists: ciFromBody es diferente de ciFromParams. Hay un conflicto de CI.');
          return res.status(400).json({
            message: `El CI "${ciFromBody}" ya está registrado por otro jugador.`,
          })
        }
      } else { // Es una petición POST (o cualquier otro método que no sea PUT)
        console.log('validateCIExists: Es una petición que NO es PUT. Se encontró un jugador existente. Bloqueando.');
        return res.status(400).json({
          message: `El CI "${ciFromBody}" ya está registrado.`, // Mensaje más genérico para POST
        })
      }

    } catch (error) {
      console.error("Error interno del servidor al validar CI:", error);
      return res.status(500).json({
        message: "Error interno del servidor al validar CI",
      })
    }
  }

  validatePhoneExists = async (req: Request, res: Response, next: NextFunction) => {
    const { phone } = req.body.playerData || {}
    const currentCI = req.params.ci

    if (!phone) {
      return next()
    }

    try {
      const player = await PlayerDB.findOne({ where: { phone: phone } })

      if (player) {
        if (currentCI && player.getDataValue("ci") === currentCI) {
          return next()
        } else {
          return res.status(400).json({
            message: "El teléfono ya está en uso por otro jugador",
          })
        }
      }
      next()
    } catch (error) {
      return res.status(500).json({
        message: "Error interno del servidor al validar teléfono",
      })
    }
  }
}

export const playerValidator = new PlayerValidator()
