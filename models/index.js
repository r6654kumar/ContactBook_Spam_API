import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv'
dotenv.config()
const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USERNAME, 
    process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        dialect:  'mysql',
    }
);
export const User = sequelize.define('User', 
            {
            phone_number: 
                        {   
                        type: DataTypes.STRING, 
                        unique: true, 
                        allowNull: false 
                        },
            name: { 
                        type: DataTypes.STRING, 
                        allowNull: false 
                   },
            email: {
                       type: DataTypes.STRING, 
                        allowNull: true 
                    },
            password: { 
                        type: DataTypes.STRING, 
                        allowNull: false },
            }
        );
export const Contact = sequelize.define('Contact',
             {
             name: { 
                type: DataTypes.STRING, 
                allowNull: false 
            },
            phone_number: { 
                type: DataTypes.STRING, 
                allowNull: false 
            },
            });
export const SpamReport = sequelize.define('SpamReport', 
            {
            phone_number: 
            { 
                type: DataTypes.STRING, 
                allowNull: false },
            });

User.hasMany(Contact, { as: 'contacts', foreignKey: 'userId' });
Contact.belongsTo(User, { foreignKey: 'userId' });
SpamReport.belongsTo(User, { foreignKey: 'reported_by' });
export const db = sequelize;
