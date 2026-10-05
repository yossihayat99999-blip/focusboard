import * as actionCourse from '../controllers/course.js'
import { verifyToken } from '../middlewares/auth.js' 
import express from 'express'
import {validate} from '../middlewares/validation.js'
import { validateCourse, validateId, validateUpdateCourse } from '../validations/validators.js'
import {sendResult} from '../utils/apiResponse.js'


const router =express.Router();
router.use(verifyToken);
//יצירת קורס
router.post('/',validate(validateCourse), async (req,res)=>{
    const {name,lecturer_id} = req.body;
    const result = await actionCourse.createCourse(name, lecturer_id, req.userId);
    sendResult(res, result);
});

router.get('/', async (req,res)=>{
    const result = await actionCourse.getCourses(req.userId);
    sendResult(res, result);
});

router.put('/:id', validate(validateUpdateCourse), validate(validateId, 'params'), async (req,res)=>{
    const result = await actionCourse.updateCourse(req.userId, req.params.id, req.body);
    sendResult(res, result);
});

router.delete('/:id', validate(validateId, 'params'), async (req,res)=>{
    const result = await actionCourse.deleteCourse(req.userId, req.params.id)
    sendResult(res, result);
});
export default router;