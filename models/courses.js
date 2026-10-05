import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

export const Courses = sequelize.define('Courses',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
         notEmpty: true,
         len: [2, 20]
        },
        set(value) {
            this.setDataValue("name", value.trim());
        }
    },
    lecturer_id:{
        type:DataTypes.INTEGER,
        allowNull:true,
        validate:{
            isInt:true,
            min: 1
        }
    }
});