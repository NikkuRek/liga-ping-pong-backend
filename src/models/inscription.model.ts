import { DataTypes } from "sequelize"

export const InscriptionModel = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  CI: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id_tournament: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  inscription_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  seed: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}
