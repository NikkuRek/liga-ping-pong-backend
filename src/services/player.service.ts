import { PlayerDB } from "../config/sequelize.config"
import type { PlayerInterface } from "../interfaces"

class PlayerService {
  async getAll() {
    try {
      const player = await PlayerDB.findAll()
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
      const player = await PlayerDB.findByPk(CI)
      if (!player) {
        return {
          status: 404,
          message: "Jugador no encontrado",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Jugador obtencio correctamente",
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
      const activePlayers = await PlayerDB.findAll({ where: { status: true } })
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
      const activePlayers = await PlayerDB.findAll({ where: { status: false } })
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

  async create(player: PlayerInterface) {
    try {
      const newPlayer = await PlayerDB.create(player as any)
      return {
        status: 201,
        message: "Jugador creado correctamente",
        data: newPlayer,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al crear jugador",
        data: null,
      }
    }
  }

  async update(CI: string, player: PlayerInterface) {
    try {
      const existingPlayer = await PlayerDB.findByPk(CI)
      if (!existingPlayer) {
        return {
          status: 404,
          message: "Jugador no encontrado",
          data: null,
        }
      }
      await PlayerDB.update(player, { where: { CI } })
      const updatedPlayer = await PlayerDB.findByPk(CI)
      return {
        status: 200,
        message: "Jugador actualizado correctamente",
        data: updatedPlayer,
      }
    } catch (error) {
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
          data: null,
        }
      }
      await PlayerDB.update({ status: false }, { where: { CI } })
      return {
        status: 200,
        message: "Jugador deshabilitado correctamente",
      }
    } catch (error) {
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
      await PlayerDB.destroy({ where: { CI } })
      return {
        status: 200,
        message: "Jugador eliminado correctamente",
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al eliminar jugador",
      }
    }
  }
}

export const PlayerServices = new PlayerService()
