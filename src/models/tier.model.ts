import { DataTypes } from "sequelize"

export const TierModel = {
  tier_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  range_name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}
