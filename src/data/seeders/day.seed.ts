import { DayDB } from "../../config/sequelize.config"

export const daySeed = async () => {
  try {
    await DayDB.bulkCreate([
      { day_id: 1, day_name: "Lunes" },
      { day_id: 2, day_name: "Martes" },
      { day_id: 3, day_name: "Miércoles" },
      { day_id: 4, day_name: "Jueves" },
      { day_id: 5, day_name: "Viernes" },
    ])
    console.log("Seed de días ejecutada correctamente")
  } catch (error) {
    console.log("Error al crear los días", error)
  }
}
