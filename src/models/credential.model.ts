import { DataTypes } from "sequelize"

export const CredentialModel = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  player_ci: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: 'unique_credential_player',
    references: {
      model: "players",
      key: "ci",
    },
  },
  password: {
    type: DataTypes.STRING,
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
