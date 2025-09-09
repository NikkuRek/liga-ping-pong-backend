import { DataTypes } from "sequelize"

export const AuraRecordModel = {
  id: {
    type: DataTypes.NUMBER,
    primaryKey: true,
  },
  match_id: {
    type: DataTypes.NUMBER,
    allowNull: false,
    references: {
      model: "match",
      key: "match_id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  player_ci: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: "player",
      key: "ci",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  aura: {
    type: DataTypes.NUMBER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
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
