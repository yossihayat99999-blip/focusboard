import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

export const Lecturers = sequelize.define('lecturers',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1
        }
    },
    name:{
        type:DataTypes.STRING(20),
        allowNull:false,
        validate: {
            notEmpty: true,
            len: [2, 20]
        },
        set(value) {
            this.setDataValue("name", value.trim());
        }
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        validate: {
            isEmail: true
        }
    }
});