import { MatchDB, SetsDB, AuraRecordDB, PlayerDB, InscriptionDB } from "../config/sequelize.config"
import type { MatchInterface } from "../interfaces"
import { auraCalculationService } from "../middlewares/aura-calculator.middlewares"
import { Op } from "sequelize"

class MatchService {
  async getAll() {
    try {
      const matches = await MatchDB.findAll({
        include: [
          { model: SetsDB },
          {
            model: InscriptionDB,
            as: "Inscription1",
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
          {
            model: InscriptionDB,
            as: "Inscription2",
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
          {
            model: InscriptionDB,
            as: "WinnerInscription",
            required: false,
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
        ],
      })
      return {
        status: 200,
        message: "Partidos obtenidos correctamente",
        data: matches,
      }
    } catch (error) {
      console.error("Error al obtener partidos:", error)
      return {
        status: 500,
        message: "Error al obtener partidos",
        data: null,
      }
    }
  }

  async getOne(match_id: number) {
    try {
      const match = await MatchDB.findByPk(match_id, {
        include: [
          { model: SetsDB },
          {
            model: InscriptionDB,
            as: "Inscription1",
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
          {
            model: InscriptionDB,
            as: "Inscription2",
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
          {
            model: InscriptionDB,
            as: "WinnerInscription",
            required: false,
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
        ],
      })
      if (!match) {
        return {
          status: 404,
          message: "Partido no encontrado",
          data: null,
        }
      }
      return {
        status: 200,
        message: "Partido obtenido correctamente",
        data: match,
      }
    } catch (error) {
      console.error("Error al obtener partido:", error)
      return {
        status: 500,
        message: "Error al obtener partido",
        data: null,
      }
    }
  }

  async create(match: MatchInterface) {
    try {
      const { createdAt, updatedAt, match_id, ...matchData } = match
      const newMatch = await MatchDB.create(matchData as any)
      return {
        status: 201,
        message: "Partido creado correctamente",
        data: newMatch,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al crear partido",
        data: null,
      }
    }
  }

  async propose(match: MatchInterface) {
    try {
      const { createdAt, updatedAt, match_id, ...matchData } = match
      ;(matchData as any).status = 'Propuesto'
      const newMatch = await MatchDB.create(matchData as any)
      return {
        status: 201,
        message: "Partido propuesto correctamente",
        data: newMatch,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al proponer partido",
        data: null,
      }
    }
  }

  async update(match_id: number, match: MatchInterface) {
    try {
      const existingMatch = await MatchDB.findByPk(match_id)
      if (!existingMatch) {
        return {
          status: 404,
          message: "Partido no encontrado",
          data: null,
        }
      }

      const previousWinner = existingMatch.getDataValue("winner_inscription_id")

      const { createdAt, updatedAt, match_id: _, ...matchData } = match

      if (match.winner_inscription_id && !previousWinner) {
        ; (matchData as any).status = "Finalizado"
      }

      await MatchDB.update(matchData, { where: { match_id } })
      const updatedMatch = await MatchDB.findByPk(match_id)

      if (match.winner_inscription_id && !previousWinner) {
        try {
          const inscription1_id = existingMatch.getDataValue("inscription1_id")
          const inscription2_id = existingMatch.getDataValue("inscription2_id")
          const winner_id = match.winner_inscription_id
          const loser_id = winner_id === inscription1_id ? inscription2_id : inscription1_id

          await auraCalculationService.updateAURAAfterMatch(winner_id, loser_id, match_id)

        } catch (auraError) {
          console.error("[AURA] Error calculating AURA, but match update succeeded:", auraError)
        }
      }

      return {
        status: 200,
        message: "Partido actualizado correctamente",
        data: updatedMatch,
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al actualizar partido",
        data: null,
      }
    }
  }

  async delete(match_id: number) {
    try {
      const match = await MatchDB.findByPk(match_id)
      if (!match) {
        return {
          status: 404,
          message: "Partido no encontrado",
        }
      }
      await MatchDB.destroy({ where: { match_id } })
      return {
        status: 200,
        message: "Partido eliminado correctamente",
      }
    } catch (error) {
      return {
        status: 500,
        message: "Error al eliminar partido",
      }
    }
  }

  async deleteCascade(match_id: number) {
    try {
      const match = await MatchDB.findByPk(match_id)
      if (!match) {
        return {
          status: 404,
          message: "Partido no encontrado",
        }
      }

      if (match.getDataValue("tournament_id") !== 1) {
        await this.revertAuraChanges(match_id)
      }

      await AuraRecordDB.destroy({ where: { match_id } })

      await SetsDB.destroy({ where: { match_id } })

      await MatchDB.destroy({ where: { match_id } })

      return {
        status: 200,
        message: "Partido y sus datos asociados eliminados correctamente",
      }
    } catch (error) {
      console.error("Error al eliminar partido en cascada:", error)
      return {
        status: 500,
        message: "Error al eliminar partido en cascada",
      }
    }
  }

  async getMatchesByPlayerCI(player_ci: string) {
    try {
      const inscriptions = await InscriptionDB.findAll({
        where: { player_ci },
        attributes: ["inscription_id"],
      })

      if (inscriptions.length === 0) {
        return {
          status: 404,
          message: "No se encontraron inscripciones para este jugador",
          data: [],
        }
      }

      const inscriptionIds = inscriptions.map((inscription) =>
        inscription.getDataValue("inscription_id")
      )

      const matches = await MatchDB.findAll({
        where: {
          [Op.or]: [
            { inscription1_id: { [Op.in]: inscriptionIds } },
            { inscription2_id: { [Op.in]: inscriptionIds } },
          ],
        },
        include: [
          { model: SetsDB },
          {
            model: InscriptionDB,
            as: "Inscription1",
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
          {
            model: InscriptionDB,
            as: "Inscription2",
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
          {
            model: InscriptionDB,
            as: "WinnerInscription",
            required: false,
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
        ],
      })

      return {
        status: 200,
        message: "Partidos obtenidos correctamente",
        data: matches,
      }
    } catch (error) {
      console.error("Error al obtener partidos por CI del jugador:", error)
      return {
        status: 500,
        message: "Error al obtener partidos por CI del jugador",
        data: null,
      }
    }
  }

  async getMatchesByCIInCurrentWeek(player_ci: string) {
    try {
      const inscriptions = await InscriptionDB.findAll({
        where: { player_ci },
        attributes: ["inscription_id"],
      });
  
      if (inscriptions.length === 0) {
        return {
          status: 404,
          message: "No se encontraron inscripciones para este jugador",
          data: [],
        };
      }
  
      const inscriptionIds = inscriptions.map((inscription) =>
        inscription.getDataValue("inscription_id")
      );
  
      const today = new Date();
      const dayOfWeek = today.getDay(); 
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
  
      const monday = new Date(today.setDate(diff));
      monday.setHours(0, 0, 0, 0);
  
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
  
      const matches = await MatchDB.findAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { inscription1_id: { [Op.in]: inscriptionIds } },
                { inscription2_id: { [Op.in]: inscriptionIds } },
              ],
            },
            {
              match_datetime: {
                [Op.between]: [monday, sunday],
              },
            },
            { tournament_id: 2 },
          ],
        },
        include: [
          { model: SetsDB },
          {
            model: InscriptionDB,
            as: "Inscription1",
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
          {
            model: InscriptionDB,
            as: "Inscription2",
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
          {
            model: InscriptionDB,
            as: "WinnerInscription",
            required: false,
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
        ],
      });
  
      return {
        status: 200,
        message: "Partidos del torneo 2 en la semana actual obtenidos correctamente",
        data: matches,
      };
    } catch (error) {
      console.error("Error al obtener partidos por CI del jugador en la semana actual:", error);
      return {
        status: 500,
        message: "Error al obtener partidos por CI del jugador en la semana actual",
        data: null,
      };
    }
  }




  async getMatchesByPlayerName(first_name: string, last_name: string) {
    try {
      // Construir cláusula where según parámetros recibidos
      const nameWhere: any = {}
      if (first_name && last_name) {
        nameWhere[Op.and] = [
          { first_name: { [Op.iLike]: `%${first_name}%` } },
          { last_name: { [Op.iLike]: `%${last_name}%` } },
        ]
      } else if (first_name) {
        nameWhere.first_name = { [Op.iLike]: `%${first_name}%` }
      } else if (last_name) {
        nameWhere.last_name = { [Op.iLike]: `%${last_name}%` }
      } else {
        return {
          status: 400,
          message: "Se requiere al menos first_name o last_name para la búsqueda",
          data: [],
        }
      }

      const players = await PlayerDB.findAll({
        where: nameWhere,
        attributes: ["ci"],
      })

      if (!players || players.length === 0) {
        return {
          status: 404,
          message: "No se encontraron jugadores con ese nombre",
          data: [],
        }
      }

      const inscriptionIds = players.map((p) => p.getDataValue("ci"))

      // Buscar inscripciones de esos jugadores
      const inscriptions = await InscriptionDB.findAll({
        where: { player_ci: { [Op.in]: inscriptionIds } },
        attributes: ["inscription_id"],
      })

      if (!inscriptions || inscriptions.length === 0) {
        return {
          status: 404,
          message: "No se encontraron inscripciones para los jugadores encontrados",
          data: [],
        }
      }

      const inscriptionIdValues = inscriptions.map((ins) => ins.getDataValue("inscription_id"))

      const matches = await MatchDB.findAll({
        where: {
          [Op.or]: [
            { inscription1_id: { [Op.in]: inscriptionIdValues } },
            { inscription2_id: { [Op.in]: inscriptionIdValues } },
          ],
        },
        include: [
          { model: SetsDB },
          {
            model: InscriptionDB,
            as: "Inscription1",
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
          {
            model: InscriptionDB,
            as: "Inscription2",
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
          {
            model: InscriptionDB,
            as: "WinnerInscription",
            required: false,
            include: [{ model: PlayerDB, attributes: ["ci", "first_name", "last_name"] }],
          },
        ],
      })

      if (!matches || matches.length === 0) {
        return {
          status: 404,
          message: "No se encontraron partidos para los jugadores buscados",
          data: [],
        }
      }

      return {
        status: 200,
        message: "Partidos obtenidos correctamente",
        data: matches,
      }
    } catch (error) {
      console.error("Error al obtener partidos por nombre del jugador:", error)
      return {
        status: 500,
        message: "Error al obtener partidos por nombre del jugador",
        data: null,
      }
    }
  }














  private async revertAuraChanges(match_id: number): Promise<void> {
    try {
      const auraRecords = await AuraRecordDB.findAll({
        where: { match_id },
        order: [["aura_record_id", "ASC"]],
      })

      if (auraRecords.length === 0) {
        console.log(`[AURA REVERT] No hay registros de aura para el partido ${match_id}`)
        return
      }

      for (const record of auraRecords) {
        const player_ci = record.getDataValue("player_ci")
        const aura_en_ese_partido = record.getDataValue("aura")
        const aura_record_id = record.getDataValue("aura_record_id")

        const previousRecord = await AuraRecordDB.findOne({
          where: {
            player_ci,
            aura_record_id: { [Op.lt]: aura_record_id },
          },
          order: [["aura_record_id", "DESC"]],
        })

        let aura_anterior: number

        if (previousRecord) {
          aura_anterior = previousRecord.getDataValue("aura")
        } else {
          const player = await PlayerDB.findByPk(player_ci)
          if (!player) {
            console.error(`[AURA REVERT] Jugador ${player_ci} no encontrado`)
            continue
          }

          const aura_actual = player.getDataValue("aura") || 1000

          aura_anterior = 1000
        }

        const cambio_de_aura = aura_en_ese_partido - aura_anterior

        const player = await PlayerDB.findByPk(player_ci)
        if (!player) {
          console.error(`[AURA REVERT] Jugador ${player_ci} no encontrado`)
          continue
        }

        const aura_actual = player.getDataValue("aura") || 1000

        const nuevo_aura = aura_actual - cambio_de_aura

        await PlayerDB.update({ aura: nuevo_aura }, { where: { ci: player_ci } })

        console.log(
          `[AURA REVERT] Jugador ${player_ci}: Aura anterior=${aura_anterior}, Aura en partido=${aura_en_ese_partido}, Cambio=${cambio_de_aura}, Aura actual=${aura_actual}, Nuevo aura=${nuevo_aura}`,
        )
      }
    } catch (error) {
      console.error("[AURA REVERT] Error al revertir cambios de aura:", error)
      throw error
    }
  }
}

export const MatchServices = new MatchService()
