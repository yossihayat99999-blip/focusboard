import { Courses,Lecturers} from "../models/index.js";


export const createCourse= async (name, lecturer_id, userId)=>{
    try{
        const courseExite = await Courses.findOne({ where: { name:name, user_id: userId } });
        const lectureExite = await Lecturers.findOne({ where: { id: lecturer_id, user_id: userId } });
        
        if(courseExite  ){
            return {
                status:400,
                data:"course already exists."
            }
        }
        if(!lectureExite){
            return{
                status:404,
                data:"The lecturer does not exist."
            }
        }
        
        await Courses.create({ name, lecturer_id, user_id: userId });
        return {
            status:201,
            data:"the course was created successfully."
        }

    }catch(err){
        return {
            status:500,
            data:err.message
        }
    }
};

export const getCourses = async (userId)=>{
    try{
        const allCourses = await Courses.findAll({
            where: { user_id: userId },
            include: {
            model:Lecturers,
            attributes: ['name','email']
            }
        });
        return {
            status:200,
            data:allCourses
        }


    }catch(err){
        return {
            status:500,
            data:err.message
        }
    }

};

export const updateCourse = async (userId, courseId, data) => {
    try {
        const course = await Courses.findOne({ where: { id: courseId, user_id: userId } });
        if (!course) {
            return { status: 404, data: 'The course does not exist.' };
        }

        const updateData = { ...data };
        if (updateData.lecturer_id !== undefined) {
            const lecturer = await Lecturers.findOne({ where: { id: updateData.lecturer_id, user_id: userId } });
            if (!lecturer) return { status: 404, data: 'The lecturer does not exist.' };
            updateData.lecturer_id = Number(updateData.lecturer_id);
        }

        const updatedCourse = await course.update(updateData);
        return { status: 200, data: updatedCourse };
    } catch (err) {
        return { status: 500, data: err.message };
    }
};

export const deleteCourse = async (userId, course_id) => {
    try{
        const courseExists = await Courses.findOne({ where: { user_id: userId, id: course_id } });
        if(!courseExists){
            return {
                status:404,
                data:"The course does not exist."
            }
        };
        await courseExists.destroy();
        return {
            status:200,
            data:"course deleted successfully" 
        };

    }catch(err){
        return {
            status:500,
            data:err.message

        }
    }
};