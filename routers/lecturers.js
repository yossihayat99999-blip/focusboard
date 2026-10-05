import * as actionLecturers from '../controllers/lecturer.js'
import { verifyToken } from '../middlewares/auth.js' 
import express from 'express'
import {validate} from '../middlewares/validation.js'
import { validateLecturer, validateId, validateUpdateLecturer } from '../validations/validators.js'
import {sendResult} from '../utils/apiResponse.js'

const router = express.Router();
router.use(verifyToken);

router.post('/', validate(validateLecturer), async (req,res)=>{
    const {name,email} = req.body;
    const result = await actionLecturers.createLecturer(name, email, req.userId);
    sendResult(res, result);
});


router.get('/', async (req,res)=>{
    const result = await actionLecturers.getLecturers(req.userId);
    sendResult(res, result);
});

router.put('/:id', validate(validateUpdateLecturer), validate(validateId, 'params'), async (req,res)=>{
    const {name,email}= req.body;
    const result = await actionLecturers.updateLecture(req.userId ,req.params.id,{name,email});
    sendResult(res, result);
});

router.delete('/:id', validate(validateId, 'params'), async (req,res)=>{
    const result = await actionLecturers.deleteLecture(req.userId, req.params.id);
    sendResult(res, result);
});

export default router;
