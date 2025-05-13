import { DataTypes } from "sequelize"

export const PlayerModel = {
  CI: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_career: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  id_tier: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  // Los campos createdAt y updatedAt serán manejados automáticamente por Sequelize
}
