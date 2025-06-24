import { DataTypes } from "sequelize"

export const AvailabilityModel = {
  player_ci: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  day_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}

// Al definir el modelo en Sequelize, usa { tableName: 'availabilities', timestamps: true }
