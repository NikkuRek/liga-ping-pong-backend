import { AvailabilityDB } from "../../config/sequelize.config"

export const availabilitySeed = async () => {
  try {
    console.log("Iniciando seed de disponibilidad...")

    const availabilityData = [
      //Peter
      { CI: "29909792", id_day: 2 },
      { CI: "29909792", id_day: 3 },
      { CI: "29909792", id_day: 4 },
      { CI: "29909792", id_day: 5 },
      //Gabriel
      { CI: "29944901", id_day: 3 },
      //Luis
      { CI: "30353315", id_day: 4 },
      { CI: "30353315", id_day: 5 },
      //Edgar
      { CI: "31366298", id_day: 1 },
      { CI: "31366298", id_day: 3 },
      { CI: "31366298", id_day: 2 },
      { CI: "31366298", id_day: 4 },
      //Samuel
      { CI: "31350493", id_day: 1 },
      { CI: "31350493", id_day: 2 },
      { CI: "31350493", id_day: 3 },
    ]

    await AvailabilityDB.bulkCreate(availabilityData)

    console.log("Seed de disponibilidad ejecutado correctamente")
  } catch (error) {
    console.error("Error al ejecutar seed de disponibilidad", error)
  }
}
