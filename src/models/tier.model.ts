import { DataTypes } from "sequelize"

export const TierModel = {
  id_tier: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  range: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}

