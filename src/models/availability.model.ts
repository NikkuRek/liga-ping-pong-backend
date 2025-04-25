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
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}

