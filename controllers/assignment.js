import { Assignments, Courses,Lecturers } from "../models/index.js"; 


const findOne = async (userId, assignmentId)=>{
    try{
        const task= await Assignments.findOne({where:{id:assignmentId,user_id:userId}});
        if(!task){
            return {
                status:404,
            }
        }
        return {
            status:200,
            data:task
        }

    }catch(err){
        return {
            status:500,
            data:err.message
        }
    }
}
export const getAssignments = async (userId, queryParams = {}) => {
    try {
        const whereClause = { user_id: userId };

        if (queryParams.course_id !== undefined) {
            whereClause.course_id = Number(queryParams.course_id);
        }

        if (queryParams.is_completed !== undefined) {
            whereClause.is_completed = queryParams.is_completed === 'true';
        }

        const assignmentData = await Assignments.findAll({ 
            where: whereClause,
            order: [['due_date', 'ASC']],
            include: [
                {
                    model: Courses,
                    attributes: ['id', 'name'], 
                    include: [
                        {
                            model: Lecturers,
                            attributes: ['name', 'email'] ,
                        }
                    ]
                }
            ]
        });

        return {
            status: 200,
            data: assignmentData
        };

    } catch (err) {
        return {
            status: 500,
            data: err.message
        };
    }
};

export const createAssignment = async (title, courseId, due_date, userId,is_completed=false) => {
    try {
        const course = await Courses.findOne({ where: { id: courseId, user_id: userId } });
        if(!course ){
            return{
                status:404,
                data:"Course not found"
            }
        
        }
    
        const assignment = await Assignments.create({ 
            title:title, 
            course_id: courseId,
            due_date,
            user_id: userId,
            is_completed:is_completed
        });
        
        return {
            status: 201,
            data: assignment
        }
    } catch (err) {
        return {
            status: 500,
            data: err.message
        }
    }
};

export const updateAssignment = async (assignmentId, userId, data) => {
    try {
        const existsAssignmentResponse = await findOne(userId, assignmentId);
        
        if (existsAssignmentResponse.status === 404) {
            return existsAssignmentResponse; 
        }
        
        const updatedAssignment = await existsAssignmentResponse.data.update(data);
        
        return {
            status: 200,
            data: updatedAssignment
        }
    } catch (err) {
        return {
            status: 500,
            data: err.message
        }
    }
};

export const deleteAssignment = async (assignmentId, userId) => {
    try {
        const existsAssignmentResponse = await findOne(userId, assignmentId);
        
        if (existsAssignmentResponse.status === 404) {
            return existsAssignmentResponse; 
        }
        
        await existsAssignmentResponse.data.destroy();
        
        return {
            status: 200,
            data: "Assignment deleted successfully" 
        }
    } catch (err) {
        return {
            status: 500,
            data: err.message
        }
    }
};