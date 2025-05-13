import { TeamInscriptionDB, TeamDB, TournamentDB, PlayerDB } from "../config/sequelize.config"
import type { TeamInscriptionInterface } from "../interfaces"

class TeamInscriptionService {
  async getAll() {
    try {
      const teamInscriptions = await TeamInscriptionDB.findAll({
        include: [
          {
            model: TeamDB,
            include: [
              { model: PlayerDB, as: "Player1" },
              { model: PlayerDB, as: "Player2" },
            ],
          },
          { model: TournamentDB },
        ],
      })
      return {
        status: 200,
        message: "Inscripciones de equipos obtenidas correctamente",
        data: teamInscriptions,
      }
    } catch (error) {
      console.error("Error al obtener inscripciones de equipos:", error)
      return {
        status: 500,
        message: "Error al obtener inscripciones de equipos",
        data: null,
      }
    }
  }

  async getOne(id: number) {
    try {
      const teamInscription = await TeamInscriptionDB.findByPk(id, {
        include: [
          {
            model: TeamDB,
            include: [
              { model: PlayerDB, as: "Player1" },
              { model: PlayerDB, as: "Player2" },
            ],
          },
          { model: TournamentDB },
        ],
      })
      if (!teamInscription) {
        return {
          status: 404,
          message: "Inscripción de equipo no encontrada",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Inscripción de equipo obtenida correctamente",
        data: teamInscription,
      }
    } catch (error) {
      console.error("Error al obtener inscripción de equipo:", error)
      return {
        status: 500,
        message: "Error al obtener inscripción de equipo",
        data: null,
      }
    }
  }

  async getByTournament(tournamentId: number) {
    try {
      const teamInscriptions = await TeamInscriptionDB.findAll({
        where: { id_tournament: tournamentId },
        include: [
          {
            model: TeamDB,
            include: [
              { model: PlayerDB, as: "Player1" },
              { model: PlayerDB, as: "Player2" },
            ],
          },
        ],
      })
      return {
        status: 200,
        message: "Inscripciones de equipos del torneo obtenidas correctamente",
        data: teamInscriptions,
      }
    } catch (error) {
      console.error("Error al obtener inscripciones de equipos del torneo:", error)
      return {
        status: 500,
        message: "Error al obtener inscripciones de equipos del torneo",
        data: null,
      }
    }
  }

  async getByTeam(teamId: number) {
    try {
      const teamInscriptions = await TeamInscriptionDB.findAll({
        where: { id_team: teamId },
        include: [{ model: TournamentDB }],
      })
      return {
        status: 200,
        message: "Inscripciones del equipo obtenidas correctamente",
        data: teamInscriptions,
      }
    } catch (error) {
      console.error("Error al obtener inscripciones del equipo:", error)
      return {
        status: 500,
        message: "Error al obtener inscripciones del equipo",
        data: null,
      }
    }
  }

  async create(teamInscription: TeamInscriptionInterface) {
    try {
      // Verificar si el equipo existe
      const team = await TeamDB.findByPk(teamInscription.id_team)
      if (!team) {
        return {
          status: 404,
          message: "Equipo no encontrado",
          data: null,
        }
      }

      // Verificar si el torneo existe
      const tournament = await TournamentDB.findByPk(teamInscription.id_tournament)
      if (!tournament) {
        return {
          status: 404,
          message: "Torneo no encontrado",
          data: null,
        }
      }

      // Verificar si el torneo es de tipo "Dobles"
      if (tournament.getDataValue("type") !== "Dobles") {
        return {
          status: 400,
          message: "Solo se pueden inscribir equipos en torneos de tipo 'Dobles'",
          data: null,
        }
      }

      // Verificar si ya existe una inscripción para este equipo en este torneo
      const existingInscription = await TeamInscriptionDB.findOne({
        where: {
          id_team: teamInscription.id_team,
          id_tournament: teamInscription.id_tournament,
        },
      })

      if (existingInscription) {
        return {
          status: 400,
          message: "El equipo ya está inscrito en este torneo",
          data: null,
        }
      }

      const { createdAt, updatedAt, ...inscriptionData } = teamInscription
      const newTeamInscription = await TeamInscriptionDB.create(inscriptionData as any)

      const createdTeamInscription = await TeamInscriptionDB.findByPk(newTeamInscription.getDataValue("id"), {
        include: [
          {
            model: TeamDB,
            include: [
              { model: PlayerDB, as: "Player1" },
              { model: PlayerDB, as: "Player2" },
            ],
          },
          { model: TournamentDB },
        ],
      })

      return {
        status: 201,
        message: "Inscripción de equipo creada correctamente",
        data: createdTeamInscription,
      }
    } catch (error) {
      console.error("Error al crear inscripción de equipo:", error)
      return {
        status: 500,
        message: "Error al crear inscripción de equipo",
        data: null,
      }
    }
  }

  async update(id: number, teamInscription: TeamInscriptionInterface) {
    try {
      const existingTeamInscription = await TeamInscriptionDB.findByPk(id)
      if (!existingTeamInscription) {
        return {
          status: 404,
          message: "Inscripción de equipo no encontrada",
          data: null,
        }
      }

      // Si se está cambiando el equipo o el torneo, verificar que no exista ya una inscripción
      if (teamInscription.id_team && teamInscription.id_tournament) {
        const currentTeam = existingTeamInscription.getDataValue("id_team")
        const currentTournament = existingTeamInscription.getDataValue("id_tournament")

        if (teamInscription.id_team !== currentTeam || teamInscription.id_tournament !== currentTournament) {
          const duplicateInscription = await TeamInscriptionDB.findOne({
            where: {
              id_team: teamInscription.id_team,
              id_tournament: teamInscription.id_tournament,
            },
          })

          if (duplicateInscription) {
            return {
              status: 400,
              message: "El equipo ya está inscrito en este torneo",
              data: null,
            }
          }

          // Si se está cambiando el torneo, verificar que sea de tipo "Dobles"
          if (teamInscription.id_tournament !== currentTournament) {
            const tournament = await TournamentDB.findByPk(teamInscription.id_tournament)
            if (tournament && tournament.getDataValue("type") !== "Dobles") {
              return {
                status: 400,
                message: "Solo se pueden inscribir equipos en torneos de tipo 'Dobles'",
                data: null,
              }
            }
          }
        }
      }

      const { createdAt, updatedAt, ...inscriptionData } = teamInscription
      await TeamInscriptionDB.update(inscriptionData, { where: { id } })

      const updatedTeamInscription = await TeamInscriptionDB.findByPk(id, {
        include: [
          {
            model: TeamDB,
            include: [
              { model: PlayerDB, as: "Player1" },
              { model: PlayerDB, as: "Player2" },
            ],
          },
          { model: TournamentDB },
        ],
      })

      return {
        status: 200,
        message: "Inscripción de equipo actualizada correctamente",
        data: updatedTeamInscription,
      }
    } catch (error) {
      console.error("Error al actualizar inscripción de equipo:", error)
      return {
        status: 500,
        message: "Error al actualizar inscripción de equipo",
        data: null,
      }
    }
  }

  async delete(id: number) {
    try {
      const teamInscription = await TeamInscriptionDB.findByPk(id)
      if (!teamInscription) {
        return {
          status: 404,
          message: "Inscripción de equipo no encontrada",
        }
      }
      await TeamInscriptionDB.destroy({ where: { id } })
      return {
        status: 200,
        message: "Inscripción de equipo eliminada correctamente",
      }
    } catch (error) {
      console.error("Error al eliminar inscripción de equipo:", error)
      return {
        status: 500,
        message: "Error al eliminar inscripción de equipo",
      }
    }
  }
}

export const TeamInscriptionServices = new TeamInscriptionService()
