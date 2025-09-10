import { AuraRecordDB } from "../../config/sequelize.config"

export const auraRecordSeed = async () => {
  try {
    console.log("Iniciando seed de registros de aura...")

    const auraRecordsToCreate = [
      {
        match_id: 1, 
        player_ci: "29944901", // Gabriel Piña
        aura: 1315,
        date: new Date("2025-05-10T10:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        match_id: 1, 
        player_ci: "29909792", // Pedro Riera
        aura: 1285,
        date: new Date("2025-05-10T10:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        match_id: 2,
        player_ci: "30353315", // Luis Cala
        aura: 1320,
        date: new Date("2025-05-11T11:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        match_id: 2,
        player_ci: "31366298", // Edgar Briceño
        aura: 1080,
        date: new Date("2025-05-11T11:00:00Z"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const createdAuraRecords = await AuraRecordDB.bulkCreate(auraRecordsToCreate)
    console.log(
      `Seed de registros de aura ejecutado correctamente. Insertados: ${createdAuraRecords.length}`,
    )
  } catch (error) {
    console.error("Error al ejecutar seed de registros de aura:", error)
    throw error
  }
}