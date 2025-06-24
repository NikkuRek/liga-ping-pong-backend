import { TierDB } from "../../config/sequelize.config"

export const tierSeed = async () => {
  try {
    await TierDB.bulkCreate([
      {
        tier_id: 1,
        range_name: "Principiante",
      },
      {
        tier_id: 2,
        range_name: "Intermedio",
      },
      {
        tier_id: 3,
        range_name: "Avanzado",
      },
    ])
    console.log("Seed de niveles ejecutado correctamente")
  } catch (error) {
    console.error("Error al ejecutar seed de niveles:", error)
  }
}
