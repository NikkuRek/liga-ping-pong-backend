import { DataTypes } from "sequelize"

export const SetsModel = {
  set_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  match_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  set_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  score_participant1: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  score_participant2: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
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
