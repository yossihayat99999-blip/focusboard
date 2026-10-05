import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import {connectDB} from './db/config.js'
import assignmentRouter from './routers/assignment.js'
import authRouter from './routers/auth.js'
import LectureRouter  from './routers/lecturers.js'
import courseRouter from './routers/course.js'
import {startCronJobs} from './jobs/reminders.js'


const app=express();
app.use(express.json());
app.use(cors());


app.use('/api/assignments', assignmentRouter);
app.use('/api/users',authRouter );
app.use('/api/lecturers',LectureRouter);
app.use('/api/courses',courseRouter);


const PORT = process.env.PORT || 3000;


const startServer = async () => {
    try {
        await connectDB(); 
        startCronJobs();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err.message);
        process.exit(1); 
    }
};

startServer();
