import { AvailabilityDB } from "../../config/sequelize.config"

export const availabilitySeed = async () => {
  try {
    console.log("Iniciando seed de disponibilidad...")

    const availabilityData = [
      //Peter
      { player_ci: "29909792", day_id: 2 },
      { player_ci: "29909792", day_id: 3 },
      { player_ci: "29909792", day_id: 4 },
      { player_ci: "29909792", day_id: 5 },
      //Gabriel
      { player_ci: "29944901", day_id: 3 },
      //Luis
      { player_ci: "30353315", day_id: 4 },
      { player_ci: "30353315", day_id: 5 },
      //Edgar
      { player_ci: "31366298", day_id: 1 },
      { player_ci: "31366298", day_id: 3 },
      { player_ci: "31366298", day_id: 2 },
      { player_ci: "31366298", day_id: 4 },
      //Samuel
      { player_ci: "31350493", day_id: 1 },
      { player_ci: "31350493", day_id: 2 },
      { player_ci: "31350493", day_id: 3 },
    ]

    await AvailabilityDB.bulkCreate(availabilityData)

    console.log("Seed de disponibilidad ejecutado correctamente")
  } catch (error) {
    console.error("Error al ejecutar seed de disponibilidad", error)
  }
}
