import { Lecturers } from "../models/index.js"; 

export const createLecturer = async (name, email, userId) => {
    try {
        const lecturerExists = await Lecturers.findOne({ where: { email, user_id: userId } });
        
        if (lecturerExists) {
            return {
                status: 400,
                data: "Lecturer already exists."
            }
        }

        await Lecturers.create({ name, email, user_id: userId });
        return {
            status: 201,
            data: "The Lecturer was created successfully."
        }

    } catch (err) {
        return {
            status: 500,
            data: err.message
        }
    }
};

export const getLecturers = async (userId) => {
    try {
        const allLecturers = await Lecturers.findAll({ where: { user_id: userId } });
        return {
            status: 200,
            data: allLecturers
        }

    } catch (err) {
        return {
            status: 500,
            data: err.message
        }
    }
};

export const deleteLecture = async (userId, id) => {
    try {
        const lecturerExists = await Lecturers.findOne({ where: { id, user_id: userId } });
        if (!lecturerExists) {
            return {
                status: 404,
                data: "The lecturer does not exist."
            }
        }

        await lecturerExists.destroy();
        return {
            status: 200,
            data: "lecturer deleted successfully"
        }

    } catch (err) {
        return {
            status: 500,
            data: err.message
        }
    }
};

export const updateLecture = async (userId, id, data) => {
    try {
        const lecturerExists = await Lecturers.findOne({ where: { id, user_id: userId } });
        if (!lecturerExists) {
            return {
                status: 404,
                data: "The lecturer does not exist."
            }
        }

        const updatedLecture = await lecturerExists.update(data);
        return {
            status: 200,
            data: updatedLecture
        }

    } catch (err) {
        return {
            status: 500,
            data: err.message
        }
    }
};