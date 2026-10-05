import express from 'express'
import * as actionUser from '../controllers/auth.js'
import rateLimit from 'express-rate-limit'
import {validate} from '../middlewares/validation.js'
import {validateLogin,validateRegister,isPassword,verificationCode,validatePasswordRecovery,validatePasswordReset} from '../validations/validators.js'
import {sendResult} from '../utils/apiResponse.js'

const router = express.Router();
const loginLimter=rateLimit({
    windowMs:1000*60*15,
    max:5,
    message:"Too many requests, try again later"

});
const verifyLimiter=rateLimit({
    windowMs:1000*60*5,
    max:5,
    message:"Too many requests, try again later"
});
const recoveryLimiter=rateLimit({
    windowMs:1000*60*15,
    max:3,
    message:"Too many requests, try again later"
});

router.post('/register',validate(validateRegister),validate(isPassword),async (req,res)=>{
    const {username, password, email, number} = req.body;
    const ip = req.ip; 
    const result = await actionUser.registerUser(username, password, email, number,ip);
    sendResult(res, result);

});
router.post('/verify',verifyLimiter,validate(verificationCode),async (req,res)=>{
    const {verificationToken,code} = req.body;
    const result = await actionUser.verificationPassword(code,verificationToken);
    sendResult(res, result);

});
router.post('/verify-request', verifyLimiter, async (req, res) => {
    const { verificationToken } = req.body;
    const result = await actionUser.requestToVerificat(verificationToken);
    sendResult(res, result);
});
router.post('/password-recovery', recoveryLimiter, validate(validatePasswordRecovery), async (req, res) => {
    const result = await actionUser.PasswordRecovery(req.body.email);
    sendResult(res, result);
});
router.post('/password-recovery/verify', verifyLimiter, validate(verificationCode), async (req, res) => {
    const { verificationToken, code } = req.body;
    const result = await actionUser.PasswordRecoveryVerificat(code, verificationToken);
    sendResult(res, result);
});
router.post('/password-reset', recoveryLimiter, validate(validatePasswordReset), async (req, res) => {
    const { resetToken, newPassword } = req.body;
    const result = await actionUser.resetPassword(newPassword, resetToken);
    sendResult(res, result);
});
router.post('/login',loginLimter,validate(validateLogin), async (req,res)=>{
    const {username, password} = req.body;
    const result = await actionUser.loginUser(username, password);
    sendResult(res, result);
});

export default router;