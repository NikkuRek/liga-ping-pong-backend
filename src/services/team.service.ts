import { TeamDB, PlayerDB } from "../config/sequelize.config"
import type { TeamInterface } from "../interfaces"
import { Op } from "sequelize" // Importar Op directamente de sequelize

class TeamService {
  async getAll() {
    try {
      const teams = await TeamDB.findAll({
        include: [
          { model: PlayerDB, as: "Player1" },
          { model: PlayerDB, as: "Player2" },
        ],
      })
      return {
        status: 200,
        message: "Equipos obtenidos correctamente",
        data: teams,
      }
    } catch (error) {
      console.error("Error al obtener equipos:", error)
      return {
        status: 500,
        message: "Error al obtener equipos",
        data: null,
      }
    }
  }

  async getOne(id: number) {
    try {
      const team = await TeamDB.findByPk(id, {
        include: [
          { model: PlayerDB, as: "Player1" },
          { model: PlayerDB, as: "Player2" },
        ],
      })
      if (!team) {
        return {
          status: 404,
          message: "Equipo no encontrado",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Equipo obtenido correctamente",
        data: team,
      }
    } catch (error) {
      console.error("Error al obtener equipo:", error)
      return {
        status: 500,
        message: "Error al obtener equipo",
        data: null,
      }
    }
  }

  async getByPlayer(CI: string) {
    try {
      const teams = await TeamDB.findAll({
        where: {
          [Op.or]: [{ player1_CI: CI }, { player2_CI: CI }], // Usar Op directamente
        },
        include: [
          { model: PlayerDB, as: "Player1" },
          { model: PlayerDB, as: "Player2" },
        ],
      })
      return {
        status: 200,
        message: "Equipos del jugador obtenidos correctamente",
        data: teams,
      }
    } catch (error) {
      console.error("Error al obtener equipos del jugador:", error)
      return {
        status: 500,
        message: "Error al obtener equipos del jugador",
        data: null,
      }
    }
  }

  async create(team: TeamInterface) {
    try {
      // Verificar que los jugadores existan
      const player1 = await PlayerDB.findByPk(team.player1_CI)
      if (!player1) {
        return {
          status: 404,
          message: "Jugador 1 no encontrado",
          data: null,
        }
      }

      const player2 = await PlayerDB.findByPk(team.player2_CI)
      if (!player2) {
        return {
          status: 404,
          message: "Jugador 2 no encontrado",
          data: null,
        }
      }

      // Verificar que los jugadores sean diferentes
      if (team.player1_CI === team.player2_CI) {
        return {
          status: 400,
          message: "Los jugadores en un equipo deben ser diferentes",
          data: null,
        }
      }

      // Verificar si ya existe un equipo con estos jugadores
      const existingTeam = await TeamDB.findOne({
        where: {
          [Op.or]: [
            // Usar Op directamente
            {
              player1_CI: team.player1_CI,
              player2_CI: team.player2_CI,
            },
            {
              player1_CI: team.player2_CI,
              player2_CI: team.player1_CI,
            },
          ],
        },
      })

      if (existingTeam) {
        return {
          status: 400,
          message: "Ya existe un equipo con estos jugadores",
          data: null,
        }
      }

      // Eliminar propiedades de timestamp si existen
      const { createdAt, updatedAt, ...teamData } = team as any
      const newTeam = await TeamDB.create(teamData)

      const createdTeam = await TeamDB.findByPk(newTeam.getDataValue("id"), {
        include: [
          { model: PlayerDB, as: "Player1" },
          { model: PlayerDB, as: "Player2" },
        ],
      })

      return {
        status: 201,
        message: "Equipo creado correctamente",
        data: createdTeam,
      }
    } catch (error) {
      console.error("Error al crear equipo:", error)
      return {
        status: 500,
        message: "Error al crear equipo",
        data: null,
      }
    }
  }

  async update(id: number, team: TeamInterface) {
    try {
      const existingTeam = await TeamDB.findByPk(id)
      if (!existingTeam) {
        return {
          status: 404,
          message: "Equipo no encontrado",
          data: null,
        }
      }

      // Si se están cambiando los jugadores, realizar validaciones
      if (team.player1_CI && team.player2_CI) {
        // Verificar que los jugadores existan
        const player1 = await PlayerDB.findByPk(team.player1_CI)
        if (!player1) {
          return {
            status: 404,
            message: "Jugador 1 no encontrado",
            data: null,
          }
        }

        const player2 = await PlayerDB.findByPk(team.player2_CI)
        if (!player2) {
          return {
            status: 404,
            message: "Jugador 2 no encontrado",
            data: null,
          }
        }

        // Verificar que los jugadores sean diferentes
        if (team.player1_CI === team.player2_CI) {
          return {
            status: 400,
            message: "Los jugadores en un equipo deben ser diferentes",
            data: null,
          }
        }

        // Verificar si ya existe otro equipo con estos jugadores
        const existingTeamWithPlayers = await TeamDB.findOne({
          where: {
            id: { [Op.ne]: id }, // Usar Op directamente
            [Op.or]: [
              // Usar Op directamente
              {
                player1_CI: team.player1_CI,
                player2_CI: team.player2_CI,
              },
              {
                player1_CI: team.player2_CI,
                player2_CI: team.player1_CI,
              },
            ],
          },
        })

        if (existingTeamWithPlayers) {
          return {
            status: 400,
            message: "Ya existe otro equipo con estos jugadores",
            data: null,
          }
        }
      }

      // Eliminar propiedades de timestamp si existen
      const { createdAt, updatedAt, ...teamData } = team as any
      await TeamDB.update(teamData, { where: { id } })

      const updatedTeam = await TeamDB.findByPk(id, {
        include: [
          { model: PlayerDB, as: "Player1" },
          { model: PlayerDB, as: "Player2" },
        ],
      })

      return {
        status: 200,
        message: "Equipo actualizado correctamente",
        data: updatedTeam,
      }
    } catch (error) {
      console.error("Error al actualizar equipo:", error)
      return {
        status: 500,
        message: "Error al actualizar equipo",
        data: null,
      }
    }
  }

  async delete(id: number) {
    try {
      const team = await TeamDB.findByPk(id)
      if (!team) {
        return {
          status: 404,
          message: "Equipo no encontrado",
        }
      }
      await TeamDB.destroy({ where: { id } })
      return {
        status: 200,
        message: "Equipo eliminado correctamente",
      }
    } catch (error) {
      console.error("Error al eliminar equipo:", error)
      return {
        status: 500,
        message: "Error al eliminar equipo",
      }
    }
  }
}

export const TeamServices = new TeamService()
