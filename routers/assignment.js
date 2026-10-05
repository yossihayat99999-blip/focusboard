import express from 'express'
import * as actionAssignment from '../controllers/assignment.js'
import { verifyToken } from '../middlewares/auth.js' 
import {validate} from '../middlewares/validation.js'
import { validateAssignment, validateUpdateAssignment,validateId, validateGetAssignment } from '../validations/validators.js'
import {sendResult} from '../utils/apiResponse.js'


const router = express.Router();

router.use(verifyToken);
// יצירת מטלה
router.post('/', validate(validateAssignment), async (req, res) => {
    const { title, course_id, due_date,is_completed } = req.body;
    const userId = req.userId;
    const result = await actionAssignment.createAssignment(title, course_id, due_date, userId,is_completed);
    sendResult(res, result);
});
// שליפת מטלות
router.get('/', validate(validateGetAssignment, 'query'), async (req, res) => {
    const userId = req.userId; 
    const result = await actionAssignment.getAssignments(userId, req.query);
    sendResult(res, result);
});

// עדכון מטלה
router.put('/:id',validate(validateUpdateAssignment),validate(validateId,'params'), async (req, res) => {

    const assignmentId = req.params.id;
    const {title,due_date,is_completed} = req.body;
    const userId = req.userId;
    const result = await actionAssignment.updateAssignment(assignmentId,userId,{title,due_date,is_completed} );
    sendResult(res, result);
  
});
// מחיקת מטלה
router.delete('/:id', validate(validateId, 'params'), async (req, res) => {
    const assignmentId = req.params.id;
    const userId = req.userId;
    const result = await actionAssignment.deleteAssignment(assignmentId, userId);
    sendResult(res, result);
});

export default router;