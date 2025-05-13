import { DataTypes } from "sequelize"

export const AvailabilityModel = {
  CI: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  id_day: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  // Los campos createdAt y updatedAt serán manejados automáticamente por Sequelize
}
