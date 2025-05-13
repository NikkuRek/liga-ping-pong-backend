import { DayDB } from "../../config/sequelize.config"

export const daySeed = async () => {
  try {
    await DayDB.bulkCreate([
      {
        id_day: 1,
        day: "Lunes",
      },
      {
        id_day: 2,
        day: "Martes",
      },
      {
        id_day: 3,
        day: "Miércoles",
      },
      {
        id_day: 4,
        day: "Jueves",
      },
      {
        id_day: 5,
        day: "Viernes",
      },
    ])
    console.log("Seed de días ejecutada correctamente")
  } catch (error) {
    console.log("Error al crear los días", error)
  }
}
