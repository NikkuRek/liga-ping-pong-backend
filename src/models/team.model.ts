import { DataTypes } from "sequelize"

export const TeamModel = {
  team_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  player1_ci: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  player2_ci: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  team_name: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
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
