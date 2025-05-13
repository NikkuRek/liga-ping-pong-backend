import { PlayerDB, DayDB } from "../config/sequelize.config"
import { ValidationError } from "sequelize"
import type { PlayerInterface } from "../interfaces"

interface CreateRequestBody {
  playerData: PlayerInterface
  available_days?: number[]
}

interface PlayerUpdateData extends Partial<PlayerInterface> {
  available_days?: number[]
}

class PlayerService {
  async getAll() {
    try {
      const player = await PlayerDB.findAll({ include: DayDB })
      return {
        status: 200,
        message: "Jugadores obtenidos correctamente",
        data: player,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener jugadores",
        data: null,
      }
    }
  }

  async getOne(CI: string) {
    try {
      const player = await PlayerDB.findByPk(CI, { include: DayDB })

      if (!player) {
        return {
          status: 404,
          message: "Jugador no encontrado",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Jugador obtenido correctamente",
        data: player,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener jugador",
        data: null,
      }
    }
  }

  async getActive() {
    try {
      const activePlayers = await PlayerDB.findAll({ where: { status: true }, include: DayDB })
      return {
        status: 200,
        message: "Jugadores activos obtenidos correctamente",
        data: activePlayers,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener jugadores activos",
        data: null,
      }
    }
  }

  async getInactive() {
    try {
      const inactivePlayers = await PlayerDB.findAll({ where: { status: false }, include: DayDB })
      return {
        status: 200,
        message: "Jugadores inactivos obtenidos correctamente",
        data: inactivePlayers,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al obtener jugadores inactivos",
        data: null,
      }
    }
  }

  async create(requestBody: CreateRequestBody) {
    try {
      const { playerData, available_days } = requestBody

      console.log("Service Create: Objeto completo recibido en el servicio:", requestBody)
      console.log("Service Create: Datos de jugador (para crear registro):", playerData)
      console.log("Service Create: Datos de disponibilidad (array):", available_days)

      // Eliminamos cualquier intento de establecer createdAt o updatedAt manualmente
      const { createdAt, updatedAt, ...playerDataToCreate } = playerData

      // Crear el registro principal del jugador con los datos de playerData
      const newPlayer = (await PlayerDB.create(playerDataToCreate as any)) as unknown as PlayerInterface
      console.log("Service Create: Jugador principal creado exitosamente. CI:", newPlayer.CI)

      // El resto del código permanece igual...
      if (available_days && Array.isArray(available_days) && available_days.length > 0) {
        console.log("Service Create: Procesando disponibilidad para IDs:", available_days)
        console.log("Service Create: Buscando instancias de DayDB con IDs:", available_days)
        const dayInstances = await DayDB.findAll({
          where: { id_day: available_days },
        })
        console.log(
          "Service Create: Instancias de DayDB encontradas:",
          dayInstances.map((d) => d.get()),
        )
        console.log("Service Create: Añadiendo asociación de días...")
        await (newPlayer as any).addDays(dayInstances)
        console.log("Service Create: Asociación de días añadida exitosamente.")
      } else {
        console.log("Service Create: No se proporcionaron datos de disponibilidad válidos.")
      }

      console.log("Service Create: Lógica de creación y disponibilidad completada.")

      return {
        status: 201,
        message: "Jugador creado correctamente",
        data: newPlayer,
      }
    } catch (error) {
      console.error("Error al crear jugador (servicio create):", error)
      if ((error as any).parent) {
        console.error("Detalles del error SQL/DB:", (error as any).parent)
        console.error("Sentencia SQL:", (error as any).sql)
      }
      if (error instanceof ValidationError) {
        console.error(
          "Errores de validación de Sequelize:",
          error.errors.map((err) => err.message),
        )
      }

      return {
        status: 500,
        message: "Error al crear jugador",
        data: null,
      }
    }
  }

  async update(CI: string, updateDataWithAvailability: PlayerUpdateData) {
    try {
      const existingPlayer = await PlayerDB.findByPk(CI)
      if (!existingPlayer) {
        return {
          status: 404,
          message: "Jugador no encontrado",
          data: null,
        }
      }
      const { available_days, createdAt, updatedAt, ...playerDataToUpdate } = updateDataWithAvailability
      await existingPlayer.update(playerDataToUpdate)
      if (updateDataWithAvailability.hasOwnProperty("available_days")) {
        if (Array.isArray(available_days)) {
          const dayInstances = await DayDB.findAll({
            where: { id_day: available_days },
          })

          await (existingPlayer as any).setDays(dayInstances)
        } else {
          console.warn(
            `Datos de disponibilidad enviados no son un array para jugador ${CI}. No se actualizará la disponibilidad.`,
          )
        }
      }
      const updatedPlayer = await PlayerDB.findByPk(CI, { include: DayDB })

      return {
        status: 200,
        message: "Jugador actualizado correctamente",
        data: updatedPlayer,
      }
    } catch (error) {
      console.error("Error al actualizar jugador (servicio update):", error)
      return {
        status: 500,
        message: "Error al actualizar jugador",
        data: null,
      }
    }
  }

  async softDelete(CI: string) {
    try {
      const player = await PlayerDB.findByPk(CI)
      if (!player) {
        return {
          status: 404,
          message: "Jugador no encontrado",
        }
      }
      await player.update({ status: false })
      return {
        status: 200,
        message: "Jugador deshabilitado correctamente",
      }
    } catch (error) {
      console.error("Error al deshabilitar jugador (servicio):", error)
      return {
        status: 500,
        message: "Error al deshabilitar jugador",
      }
    }
  }

  async delete(CI: string) {
    try {
      const player = await PlayerDB.findByPk(CI)
      if (!player) {
        return {
          status: 404,
          message: "Jugador no encontrado",
        }
      }
      await player.destroy()
      return {
        status: 200,
        message: "Jugador eliminado correctamente",
      }
    } catch (error) {
      console.error("Error al eliminar jugador (servicio):", error)
      return {
        status: 500,
        message: "Error al eliminar jugador",
      }
    }
  }
}

export const PlayerServices = new PlayerService()
