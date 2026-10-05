import { DataTypes } from "sequelize";
import sequelize from "../db/config.js";

export const Assignments=sequelize.define('Assignments',{
      id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
        allowNull:false,
    },
    title:{
        type:DataTypes.STRING,
        allowNull:false,
        validate:{
            notEmpty:true,
            len:[2,20],
        },
        set(value) {
           this.setDataValue("title", value.trim());
        }
    },
    course_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        validate:{
            isInt:true,
            min: 1
        }
    },
    due_date:{
        type:DataTypes.DATE,
        allowNull:false,
        validate: {
          isDate: true,
          isNotPast(value) {
            if (new Date(value) < new Date()) {
               throw new Error("Due date cannot be in the past");
        }
      }
      }
    },
    is_completed:{
      type:DataTypes.BOOLEAN,
      allowNull:false,
      defaultValue:false
    },
    user_id:{
        type:DataTypes.INTEGER,
        allowNull:false,
        validate:{
            isInt:true,
            min:1
        }
    },
    is_reminder_sent:{
        type:DataTypes.BOOLEAN,
        allowNull:false,
        defaultValue:false
    }
});