import { body, param } from "express-validator"

export const createAuraRecordValidator = [
    body("match_id")
        .isInt({ min: 1 })
        .withMessage("El campo match_id debe ser un número entero positivo"),
    body("player_ci")
        .isString()
        .notEmpty()
        .withMessage("El campo player_ci es requerido"),
    body("aura")
        .isInt()
        .withMessage("El campo aura debe ser un número entero"),
    body("date")
        .isISO8601()
        .withMessage("El campo date debe ser una fecha válida"),
]

export const updateAuraRecordValidator = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("El id debe ser un número entero positivo"),
    body("match_id")
        .optional()
        .isInt({ min: 1 })
        .withMessage("El campo match_id debe ser un número entero positivo"),
    body("player_ci")
        .optional()
        .isString()
        .notEmpty()
        .withMessage("El campo player_ci es requerido"),
    body("aura")
        .optional()
        .isInt()
        .withMessage("El campo aura debe ser un número entero"),
    body("date")
        .optional()
        .isISO8601()
        .withMessage("El campo date debe ser una fecha válida"),
]

export const auraRecordIdValidator = [
    param("id")
        .isInt({ min: 1 })
        .withMessage("El id debe ser un número entero positivo"),
]

export const auraRecordPlayerValidator = [
    param("ci")
        .isString()
        .notEmpty()
        .withMessage("El campo ci es requerido"),
]

export const auraRecordMatchValidator = [
    param("matchId")
        .isInt({ min: 1 })
        .withMessage("El campo matchId debe ser un número entero positivo"),
]