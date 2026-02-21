import { DataTypes } from "sequelize"

export const AdministratorModel = {
  admin_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  player_ci: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'unique_admin_player',
    references: {
      model: "players",
      key: "ci",
    },
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
