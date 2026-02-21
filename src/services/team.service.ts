import { TeamDB, PlayerDB } from "../config/sequelize.config"
import type { TeamInterface } from "../interfaces"
import { Op, IncludeOptions } from "sequelize"

class TeamService {
  private readonly defaultIncludes: IncludeOptions[] = [
    { model: PlayerDB, as: "Player1" },
    { model: PlayerDB, as: "Player2" },
  ]

  async getAll() {
    try {
      const teams = await TeamDB.findAll({
        include: this.defaultIncludes,
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

  async getOne(team_id: number) {
    try {
      const team = await TeamDB.findByPk(team_id, {
        include: this.defaultIncludes,
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

  async getByPlayer(ci: string) {
    try {
      const teams = await TeamDB.findAll({
        where: {
          [Op.or]: [{ player1_ci: ci }, { player2_ci: ci }],
        },
        include: this.defaultIncludes,
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
      const player1 = await PlayerDB.findByPk(team.player1_ci)
      if (!player1) {
        return {
          status: 404,
          message: "Jugador 1 no encontrado",
          data: null,
        }
      }

      const player2 = await PlayerDB.findByPk(team.player2_ci)
      if (!player2) {
        return {
          status: 404,
          message: "Jugador 2 no encontrado",
          data: null,
        }
      }

      // Verificar que los jugadores sean diferentes
      if (team.player1_ci === team.player2_ci) {
        return {
          status: 400,
          message: "Los jugadores en un equipo deben ser diferentes",
          data: null,
        }
      }

      // Verificar si ya existe un equipo con estos jugadores (en cualquier orden)
      const existingTeam = await TeamDB.findOne({
        where: {
          [Op.or]: [
            {
              player1_ci: team.player1_ci,
              player2_ci: team.player2_ci,
            },
            {
              player1_ci: team.player2_ci,
              player2_ci: team.player1_ci,
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

      const createdTeam = await TeamDB.findByPk(newTeam.getDataValue("team_id"), {
        include: this.defaultIncludes,
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

  async update(team_id: number, team: TeamInterface) {
    try {
      const existingTeam = await TeamDB.findByPk(team_id)
      if (!existingTeam) {
        return {
          status: 404,
          message: "Equipo no encontrado",
          data: null,
        }
      }

      // Si se están cambiando los jugadores, realizar validaciones
      if (team.player1_ci && team.player2_ci) {
        // Verificar que los jugadores existan
        const player1 = await PlayerDB.findByPk(team.player1_ci)
        if (!player1) {
          return {
            status: 404,
            message: "Jugador 1 no encontrado",
            data: null,
          }
        }

        const player2 = await PlayerDB.findByPk(team.player2_ci)
        if (!player2) {
          return {
            status: 404,
            message: "Jugador 2 no encontrado",
            data: null,
          }
        }

        // Verificar que los jugadores sean diferentes
        if (team.player1_ci === team.player2_ci) {
          return {
            status: 400,
            message: "Los jugadores en un equipo deben ser diferentes",
            data: null,
          }
        }

        // Verificar si ya existe otro equipo con estos jugadores
        const existingTeamWithPlayers = await TeamDB.findOne({
          where: {
            team_id: { [Op.ne]: team_id },
            [Op.or]: [
              {
                player1_ci: team.player1_ci,
                player2_ci: team.player2_ci,
              },
              {
                player1_ci: team.player2_ci,
                player2_ci: team.player1_ci,
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
      await TeamDB.update(teamData, { where: { team_id } })

      const updatedTeam = await TeamDB.findByPk(team_id, {
        include: this.defaultIncludes,
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

  async delete(team_id: number) {
    try {
      const team = await TeamDB.findByPk(team_id)
      if (!team) {
        return {
          status: 404,
          message: "Equipo no encontrado",
        }
      }
      await TeamDB.destroy({ where: { team_id } })
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

  async patch(team_id: number, teamData: Partial<TeamInterface>) {
    try {
      const team = await TeamDB.findByPk(team_id);
      if (!team) {
        return { status: 404, message: "Equipo no encontrado" };
      }

      const { createdAt, updatedAt, team_id: _, ...dataToUpdate } = teamData as any;
      await TeamDB.update(dataToUpdate, { where: { team_id } });
      
      const updatedTeam = await TeamDB.findByPk(team_id, {
        include: this.defaultIncludes
      });

      return {
        status: 200,
        message: "Equipo actualizado parcialmente",
        data: updatedTeam,
      }
    } catch (error) {
      console.error("Error al parchear equipo:", error);
      return { status: 500, message: "Error al actualizar equipo" };
    }
  }
}

export const TeamServices = new TeamService()
