import { Users } from "./users.js";
import { Assignments } from "./assignments.js";
import { Courses } from "./courses.js";
import { Lecturers } from "./lecturers.js";

Users.hasMany(Lecturers, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Lecturers.belongsTo(Users, { foreignKey: 'user_id' });

Users.hasMany(Courses, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Courses.belongsTo(Users, { foreignKey: 'user_id' });

Users.hasMany(Assignments, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Assignments.belongsTo(Users, { foreignKey: 'user_id' });

Lecturers.hasMany(Courses, { foreignKey: 'lecturer_id', onDelete: 'SET NULL' });
Courses.belongsTo(Lecturers, { foreignKey: 'lecturer_id' });

Courses.hasMany(Assignments, { foreignKey: 'course_id', onDelete: 'CASCADE' });
Assignments.belongsTo(Courses, { foreignKey: 'course_id' });

export {Users,Assignments,Courses,Lecturers};