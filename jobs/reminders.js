import cron from 'node-cron';
import { sendMail } from '../utils/mailer.js';
import { Assignments, Users, Courses } from '../models/index.js';
import { Op } from 'sequelize';

export const startCronJobs = () => {
    cron.schedule('* * * * *', async () => {
        const tomorrowStart = new Date();
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        tomorrowStart.setHours(0, 0, 0, 0);

        const tomorrowEnd = new Date(tomorrowStart);
        tomorrowEnd.setHours(23, 59, 59, 999);
        
        try {
            const assignmentALL = await Assignments.findAll({
                where: {
                    is_completed: false,
                    is_reminder_sent: false, 
                    due_date: { [Op.between]: [tomorrowStart, tomorrowEnd] }
                },
                include: [
                    { model: Users, attributes: ['email'] },
                    { model: Courses, attributes: ['name'] }
                ]
            });

            if (assignmentALL.length === 0) {
                console.log("There are no assignments for tomorrow.");
                return;
            }

            for (const task of assignmentALL) {
                const to = task.User.email;
                const subject = `Submit by tomorrow: ${task.Course.name}`;
                const text = `You have an assignment due tomorrow in ${task.Course.name}. Good luck!`;

                const result = await sendMail(to, subject, text);
                if (result.status === 200) {
                    await task.update({ is_reminder_sent: true });
                }
            }
            console.log("The emails were sent successfully.");
       
        } catch(err) {
            console.error("Cron Error: ", err);
        }
    });
};