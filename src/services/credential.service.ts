import { CredentialDB, PlayerDB } from "../config/sequelize.config"
import { ValidationError } from "sequelize"
import type { CredentialInterface } from "../interfaces"
import bcrypt from "bcrypt"

class CredentialService {
  async getAll() {
    try {
      const credentials = await CredentialDB.findAll({
        include: {
          model: PlayerDB,
          as: "Player",
          attributes: ["ci", "first_name", "last_name"],
        },
      })
      return {
        status: 200,
        message: "Credenciales obtenidas correctamente",
        data: credentials,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener credenciales",
        data: null,
      }
    }
  }

  async getOne(id: string) {
    try {
      const credential = await CredentialDB.findByPk(id, {
        include: {
          model: PlayerDB,
          as: "Player",
          attributes: ["ci", "first_name", "last_name"],
        },
      })

      if (!credential) {
        return {
          status: 404,
          message: "Credencial no encontrada",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Credencial obtenida correctamente",
        data: credential,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener credencial",
        data: null,
      }
    }
  }

  async getByPlayerCI(player_ci: string) {
    try {
      console.log("[v0] Searching credential for player_ci:", player_ci)

      const player = await PlayerDB.findByPk(player_ci)
      console.log("[v0] Player exists:", player ? "Yes" : "No")

      if (!player) {
        return {
          status: 404,
          message: "Jugador no encontrado",
          data: null,
        }
      }

      const credential = await CredentialDB.findOne({
        where: { player_ci },
        include: {
          model: PlayerDB,
          as: "Player",
          attributes: ["ci", "first_name", "last_name"],
        },
      })

      console.log("[v0] Found credential:", credential ? "Yes" : "No")

      if (!credential) {
        return {
          status: 404,
          message: "Credencial no encontrada para este jugador",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Credencial obtenida correctamente",
        data: credential,
      }
    } catch (error) {
      console.log("[v0] Error in getByPlayerCI:", error)
      return { 
        status: 500,
        message: "Error al obtener credencial",
        data: null,
      }
    }
  }

  async create(credentialData: CredentialInterface) {
    try {
      // Verificar que el jugador existe
      const player = await PlayerDB.findByPk(credentialData.player_ci)
      if (!player) {
        return {
          status: 404,
          message: "Jugador no encontrado",
          data: null,
        }
      }

      // Verificar que no existe ya una credencial para este jugador
      const existingCredential = await CredentialDB.findOne({
        where: { player_ci: credentialData.player_ci },
      })
      if (existingCredential) {
        return {
          status: 400,
          message: "Ya existe una credencial para este jugador",
          data: null,
        }
      }

      // Encriptar la contraseña
      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(credentialData.password, saltRounds)

      const newCredential = await CredentialDB.create({
        ...credentialData,
        password: hashedPassword,
      })

      return {
        status: 201,
        message: "Credencial creada correctamente",
        data: newCredential,
      }
    } catch (error) {
      console.error("Error al crear credencial:", error)
      if (error instanceof ValidationError) {
        console.error(
          "Errores de validación:",
          error.errors.map((err) => err.message),
        )
      }
      return {
        status: 500,
        message: "Error al crear credencial",
        data: null,
      }
    }
  }

  async update(id: string, credentialData: Partial<CredentialInterface>) {
    try {
      const existingCredential = await CredentialDB.findByPk(id)
      if (!existingCredential) {
        return {
          status: 404,
          message: "Credencial no encontrada",
          data: null,
        }
      }

      // Si se está actualizando la contraseña, encriptarla
      if (credentialData.password) {
        const saltRounds = 10
        credentialData.password = await bcrypt.hash(credentialData.password, saltRounds)
      }

      await existingCredential.update(credentialData)

      const updatedCredential = await CredentialDB.findByPk(id, {
        include: {
          model: PlayerDB,
          as: "Player",
          attributes: ["ci", "first_name", "last_name"],
        },
      })

      return {
        status: 200,
        message: "Credencial actualizada correctamente",
        data: updatedCredential,
      }
    } catch (error) {
      console.error("Error al actualizar credencial:", error)
      return {
        status: 500,
        message: "Error al actualizar credencial",
        data: null,
      }
    }
  }

  async updateByPlayerCI(player_ci: string, credentialData: Partial<CredentialInterface>) {
    try {
      const existingCredential = await CredentialDB.findOne({
        where: { player_ci },
      })

      if (!existingCredential) {
        return {
          status: 404,
          message: "Credencial no encontrada para este jugador",
          data: null,
        }
      }

      // Si se está actualizando la contraseña, encriptarla
      if (credentialData.password) {
        const saltRounds = 10
        credentialData.password = await bcrypt.hash(credentialData.password, saltRounds)
      }

      await existingCredential.update(credentialData)

      const updatedCredential = await CredentialDB.findOne({
        where: { player_ci },
        include: {
          model: PlayerDB,
          as: "Player",
          attributes: ["ci", "first_name", "last_name"],
        },
      })

      return {
        status: 200,
        message: "Credencial actualizada correctamente",
        data: updatedCredential,
      }
    } catch (error) {
      console.error("Error al actualizar credencial por CI:", error)
      return {
        status: 500,
        message: "Error al actualizar credencial",
        data: null,
      }
    }
  }

  async delete(id: string) {
    try {
      const credential = await CredentialDB.findByPk(id)
      if (!credential) {
        return {
          status: 404,
          message: "Credencial no encontrada",
        }
      }
      await credential.destroy()
      return {
        status: 200,
        message: "Credencial eliminada correctamente",
      }
    } catch (error) {
      console.error("Error al eliminar credencial:", error)
      return {
        status: 500,
        message: "Error al eliminar credencial",
      }
    }
  }

  async authenticate(player_ci: string, password: string) {
    try {
      const credential = await CredentialDB.findOne({
        where: { player_ci },
        include: {
          model: PlayerDB,
          as: "Player",
        },
      })

      if (!credential) {
        return {
          status: 404,
          message: "Credenciales no encontradas",
          data: null,
        }
      }

      const isPasswordValid = await bcrypt.compare(password, credential.getDataValue('password'))
      if (!isPasswordValid) {
        return {
          status: 401,
          message: "Contraseña incorrecta",
          data: null,
        }
      }

      return {
        status: 200,
        message: "Autenticación exitosa",
        data: {
          credential: credential,
          player: (credential as any).Player,
        },
      }
    } catch (error) {
      console.error("Error en autenticación:", error)
      return {
        status: 500,
        message: "Error en autenticación",
        data: null,
      }
    }
  }
}

export const CredentialServices = new CredentialService()
