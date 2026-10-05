import { DataTypes } from "sequelize";
import sequelize from "../db/config.js"; 
import bcrypt from 'bcrypt'; 

export const Users = sequelize.define('Users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    username: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [2, 20]
        },
        set(value) {
            this.setDataValue('username', value.trim());
        }
    },
    email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            isEmail: true
        },
        set(value) {
            this.setDataValue('email', value.trim().toLowerCase());
        }
    },
    number: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [9, 20],
            is: /^[0-9+()\-\s]+$/
        },
        set(value) {
            this.setDataValue('number', value.trim());
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            const amountSalt = parseInt(process.env.SALT_FOR_HASH, 10) || 10; 
            const hashedPassword = bcrypt.hashSync(value, amountSalt);
            this.setDataValue('password', hashedPassword);
        }
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    verification_password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    verification_sent_at: {
        type:DataTypes.DATE,
        allowNull:true
    },
    verification_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    verification_locked_until: {
        type: DataTypes.DATE,
        allowNull: true
    },
    password_reset_used_at:{
        type: DataTypes.DATE,
        allowNull: true
    }
});