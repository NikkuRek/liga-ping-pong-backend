import { DataTypes } from "sequelize"

export const SetsModel = {
  id_sets: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  match_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  score1: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  score2: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}
