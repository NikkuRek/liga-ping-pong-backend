import { DataTypes } from "sequelize"

export const TeamModel = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  player1_CI: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  player2_CI: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  team_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}
