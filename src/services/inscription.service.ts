import { InscriptionDB, PlayerDB, TournamentDB, TournamentPlayerStatsDB } from "../config/sequelize.config"
import type { InscriptionInterface } from "../interfaces"

class InscriptionService {
  async getAll() {
    try {
      const inscriptions = await InscriptionDB.findAll({
        include: [{ model: PlayerDB }, { model: TournamentDB }],
      })
      return {
        status: 200,
        message: "Inscripciones obtenidas correctamente",
        data: inscriptions,
      }
    } catch (error) {
      console.error("Error al obtener inscripciones:", error)
      return {
        status: 500,
        message: "Error al obtener inscripciones",
        data: null,
      }
    }
  }

  async getOne(id: number) {
    try {
      const inscription = await InscriptionDB.findByPk(id, {
        include: [{ model: PlayerDB }, { model: TournamentDB }, { model: TournamentPlayerStatsDB }],
      })
      if (!inscription) {
        return {
          status: 404,
          message: "Inscripción no encontrada",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Inscripción obtenida correctamente",
        data: inscription,
      }
    } catch (error) {
      console.error("Error al obtener inscripción:", error)
      return {
        status: 500,
        message: "Error al obtener inscripción",
        data: null,
      }
    }
  }

  async getByTournament(tournamentId: number) {
    try {
      const inscriptions = await InscriptionDB.findAll({
        where: { id_tournament: tournamentId },
        include: [{ model: PlayerDB }, { model: TournamentPlayerStatsDB }],
      })
      return {
        status: 200,
        message: "Inscripciones del torneo obtenidas correctamente",
        data: inscriptions,
      }
    } catch (error) {
      console.error("Error al obtener inscripciones del torneo:", error)
      return {
        status: 500,
        message: "Error al obtener inscripciones del torneo",
        data: null,
      }
    }
  }

  async getByPlayer(CI: string) {
    try {
      const inscriptions = await InscriptionDB.findAll({
        where: { CI: CI },
        include: [{ model: TournamentDB }, { model: TournamentPlayerStatsDB }],
      })
      return {
        status: 200,
        message: "Inscripciones del jugador obtenidas correctamente",
        data: inscriptions,
      }
    } catch (error) {
      console.error("Error al obtener inscripciones del jugador:", error)
      return {
        status: 500,
        message: "Error al obtener inscripciones del jugador",
        data: null,
      }
    }
  }

  async create(inscription: InscriptionInterface) {
    try {
      // Verificar si el jugador existe
      const player = await PlayerDB.findByPk(inscription.CI)
      if (!player) {
        return {
          status: 404,
          message: "Jugador no encontrado",
          data: null,
        }
      }

      // Verificar si el torneo existe
      const tournament = await TournamentDB.findByPk(inscription.id_tournament)
      if (!tournament) {
        return {
          status: 404,
          message: "Torneo no encontrado",
          data: null,
        }
      }

      // Verificar si ya existe una inscripción para este jugador en este torneo
      const existingInscription = await InscriptionDB.findOne({
        where: {
          CI: inscription.CI,
          id_tournament: inscription.id_tournament,
        },
      })

      if (existingInscription) {
        return {
          status: 400,
          message: "El jugador ya está inscrito en este torneo",
          data: null,
        }
      }

      const { createdAt, updatedAt, ...inscriptionData } = inscription
      const newInscription = await InscriptionDB.create(inscriptionData as any)

      // Crear estadísticas iniciales para el jugador en este torneo
      await TournamentPlayerStatsDB.create({
        id_inscription: newInscription.getDataValue("id"),
      })

      // Obtener la inscripción con sus relaciones
      const createdInscription = await InscriptionDB.findByPk(newInscription.getDataValue("id"), {
        include: [{ model: PlayerDB }, { model: TournamentDB }, { model: TournamentPlayerStatsDB }],
      })

      return {
        status: 201,
        message: "Inscripción creada correctamente",
        data: createdInscription,
      }
    } catch (error) {
      console.error("Error al crear inscripción:", error)
      return {
        status: 500,
        message: "Error al crear inscripción",
        data: null,
      }
    }
  }

  async update(id: number, inscription: InscriptionInterface) {
    try {
      const existingInscription = await InscriptionDB.findByPk(id)
      if (!existingInscription) {
        return {
          status: 404,
          message: "Inscripción no encontrada",
          data: null,
        }
      }

      // Si se está cambiando el jugador o el torneo, verificar que no exista ya una inscripción
      if (inscription.CI && inscription.id_tournament) {
        const currentCI = existingInscription.getDataValue("CI")
        const currentTournament = existingInscription.getDataValue("id_tournament")

        if (inscription.CI !== currentCI || inscription.id_tournament !== currentTournament) {
          const duplicateInscription = await InscriptionDB.findOne({
            where: {
              CI: inscription.CI,
              id_tournament: inscription.id_tournament,
            },
          })

          if (duplicateInscription) {
            return {
              status: 400,
              message: "El jugador ya está inscrito en este torneo",
              data: null,
            }
          }
        }
      }

      const { createdAt, updatedAt, ...inscriptionData } = inscription
      await InscriptionDB.update(inscriptionData, { where: { id } })

      const updatedInscription = await InscriptionDB.findByPk(id, {
        include: [{ model: PlayerDB }, { model: TournamentDB }, { model: TournamentPlayerStatsDB }],
      })

      return {
        status: 200,
        message: "Inscripción actualizada correctamente",
        data: updatedInscription,
      }
    } catch (error) {
      console.error("Error al actualizar inscripción:", error)
      return {
        status: 500,
        message: "Error al actualizar inscripción",
        data: null,
      }
    }
  }

  async delete(id: number) {
    try {
      const inscription = await InscriptionDB.findByPk(id)
      if (!inscription) {
        return {
          status: 404,
          message: "Inscripción no encontrada",
        }
      }
      await InscriptionDB.destroy({ where: { id } })
      return {
        status: 200,
        message: "Inscripción eliminada correctamente",
      }
    } catch (error) {
      console.error("Error al eliminar inscripción:", error)
      return {
        status: 500,
        message: "Error al eliminar inscripción",
      }
    }
  }
}

export const InscriptionServices = new InscriptionService()
