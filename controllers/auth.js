import { Users } from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/mailer.js';
import { randomInt } from 'node:crypto';

const VERIFICATION_TTL_MS = 5 * 60 * 1000;
const MAX_VERIFICATION_ATTEMPTS = 5;
const VERIFICATION_LOCK_MS = 15 * 60 * 1000;


export const registerUser = async (username, password, email, number, ip) => {
    const checkIp = ipLimiter(ip);
    if (checkIp.status !== 200) {
        return {
            status: checkIp.status,
            data: checkIp.data
        };
    }

    try {
        const existUsername = await Users.findOne({ where: { username: username } });
        if (existUsername) {
            return {
                status: 400,
                data: 'Registration could not be completed'
            };
        }

        const existEmail = await Users.findOne({ where: { email: email.trim().toLowerCase() } });
        if (existEmail) {
            return {
                status: 400,
                data: 'Registration could not be completed'
            };
        }

        const codeString = randomInt(100000, 1000000).toString();
        const hashedCode = await bcrypt.hash(codeString, 10);


        const newUser = await Users.create({
            username,
            password,
            email,
            number,
            verification_password: hashedCode,
            verification_sent_at: new Date(),
            verification_attempts: 0,
            verification_locked_until: null
        });
        
        const verificationToken = jwt.sign({
            id: newUser.id,
            purpose: 'email-verification'
            },
            process.env.JWT_SECRET,
            { 
            expiresIn: '10m'
        }
        );

        incrementIpCount(ip);

        const result= await sendMail(email,'אימות חשבון חדש',`קוד אימות שלך הוא: ${codeString}`);
        if(result.status!=200){
            await newUser.destroy();
            return{
                status:result.status,
                data:"Error sending email"
            }
        }

        return {
            status: 201,
            data: {
                message: 'Registration successful. Please check your email for the verification code.',
                verificationToken
            }
        };
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return {
                status: 400,
                data: 'Registration could not be completed'
            };
        }
        return {
            status: 500,
            data: 'Internal server error'
        };
    }
};

export const loginUser = async (username, password) => {
    try {
        const existUsername = await Users.findOne({ where: { username: username } });

        if (!existUsername) {
            return { status: 401, data: 'Username or password is not correct' };
        }


        if (!existUsername.is_verified) {
            return { status: 403, data: 'Please verify your email address before logging in.' };
        }

        const isPasswordValid = await bcrypt.compare(password, existUsername.password);

        if (!isPasswordValid) {
            return { status: 401, data: 'Username or password is not correct' };
        }

        const token = jwt.sign(
            { id: existUsername.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return {
            status: 200,
            data: {
                message: 'Login successful',
                token: token
            }
        };
    } catch (err) {
        console.error(err);
        return {
            status: 500,
            data: 'Internal server error'
        };
    }
};

export const verificationPassword = async (code, verificationToken) => {
    try {
        const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);

        if (decoded.purpose !== 'email-verification' || !decoded.id) {
            return {
                status: 400,
                data: 'Invalid verification token'
            };
        }

        const user = await Users.findByPk(decoded.id);

        if (!user) {
            return {
                status: 404,
                data: 'User not found'
            };
        }
        if (!user.verification_password || !user.verification_sent_at) {
            return {
                status: 400,
                data: 'Verification code is missing. Please request a new code.'
            };
        }

        if (user.verification_locked_until && new Date(user.verification_locked_until).getTime() > Date.now()) {
            return {
                status: 429,
                data: 'Verification is temporarily locked. Please request a new code.'
            };
        }

        if (user.verification_locked_until) {
            await user.update({
                verification_attempts: 0,
                verification_locked_until: null
            });
        }
     
        const timePassed = Date.now() - new Date(user.verification_sent_at).getTime();
        if (timePassed >= VERIFICATION_TTL_MS) {
            await user.update({
                verification_password: null,
                verification_sent_at: null,
                verification_attempts: 0,
                verification_locked_until: null
            });
            return {
                status: 400,
                data: 'Verification code expired. Please request a new code or register again.'
            };
        }
        const isPasswordValid = await bcrypt.compare(String(code), user.verification_password);
        if (!isPasswordValid) {
            const attempts = (Number(user.verification_attempts) || 0) + 1;
            const updateData = { verification_attempts: attempts };

            if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
                updateData.verification_locked_until = new Date(Date.now() + VERIFICATION_LOCK_MS);
            }

            await user.update(updateData);
            return {
                status: attempts >= MAX_VERIFICATION_ATTEMPTS ? 429 : 400,
                data: attempts >= MAX_VERIFICATION_ATTEMPTS
                    ? 'Too many invalid codes. Please request a new code later.'
                    : 'Invalid verification code'
            };
        }

        await user.update({
            is_verified: true,
            verification_password: null,
            verification_sent_at: null,
            verification_attempts: 0,
            verification_locked_until: null
        });

        return {
            status: 200,
            data: 'Account verified successfully. You can now log in.'
        };
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return {
                status: 400,
                data: 'Invalid or expired verification token'
            };
        }
        console.error(err);
        return {
            status: 500,
            data: 'Internal server error'
        };
    }
};

export const requestToVerificat= async (verificationToken)=>{
    try{
        const decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);

        if (decoded.purpose !== 'email-verification' || !decoded.id) {
            return {
                status: 400,
                data: 'Invalid verification token'
            };
        }

        const user = await Users.findByPk(decoded.id);
        if(!user){
            return {
                status:404,
                data:"id not found"
            }
        }
        if (user.is_verified) {
            return {
                status:400,
                data:"Account is already verified"
            };
        }
        const codeString = randomInt(100000, 1000000).toString();
        const hashedCode = await bcrypt.hash(codeString, 10);

        await user.update({
            verification_password:hashedCode,
            verification_sent_at:new Date(),
            verification_attempts: 0,
            verification_locked_until: null
        });
        const result = await sendMail(user.email,'קוד אימות חדש',`קוד האימות שלך הוא: ${codeString}`);
        if(result.status!=200){
            await user.update({
               verification_password:null,
               verification_sent_at:null,
               verification_attempts: 0,
              verification_locked_until: null
             }); 
             return {
                status:result.status,
                data:"Error sending email"
             }
        }
        return {
            status:200,
            data:"The new verification code has been sent to your email; please check your inbox."
        }
    
    }catch(err){
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return {
                status: 400,
                data: 'Invalid or expired verification token'
            };
        }
        console.error(err);
        return {
            status:500,
            data:'Internal server error'
        }
    }
}
export const PasswordRecoveryVerificat = async (code, verificatiOnToken) => {
    try {
        const decoded = jwt.verify(verificatiOnToken, process.env.JWT_SECRET);

        if (decoded.purpose !== 'password-recovery-code' || !decoded.id) {
            return {
                status: 400,
                data: 'Invalid verification token'
            };
        }

        const user = await Users.findByPk(decoded.id);

        if (!user) {
            return {
                status: 404,
                data: 'User not found'
            };
        }
        if (!user.verification_password || !user.verification_sent_at) {
            return {
                status: 400,
                data: 'Verification code is missing. Please request a new code.'
            };
        }

        if (user.verification_locked_until && new Date(user.verification_locked_until).getTime() > Date.now()) {
            return { 
                status: 429,
                data: 'Verification is temporarily locked. Please request a new code.' 
            };
        }

        if (Date.now() - new Date(user.verification_sent_at).getTime() >= VERIFICATION_TTL_MS) {
            await user.update({
                verification_password: null,
                verification_sent_at: null,
                verification_attempts: 0,
                verification_locked_until: null
            });
            return { 
                status: 400,
                data: 'Verification code expired. Please request a new code.'
            };
        }

        const isPasswordValid = await bcrypt.compare(String(code), user.verification_password);
        if (!isPasswordValid) {
            const attempts = (Number(user.verification_attempts) || 0) + 1;
            const updateData = { verification_attempts: attempts };
            if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
                updateData.verification_locked_until = new Date(Date.now() + VERIFICATION_LOCK_MS);
            }
            await user.update(updateData);
            return {
                status: attempts >= MAX_VERIFICATION_ATTEMPTS ? 429 : 400,
                data: attempts >= MAX_VERIFICATION_ATTEMPTS
                    ? 'Too many invalid codes. Please request a new code later.'
                    : 'Invalid verification code'
            };
        }

        await user.update({
            verification_password: null,
            verification_sent_at: null,
            verification_attempts: 0,
            verification_locked_until: null,
            password_reset_used_at: null
        });
        const verificationToken = jwt.sign({
            id: user.id,
            purpose: 'password-reset'
            },
            process.env.JWT_SECRET,
            { 
            expiresIn: '10m'
        }
        );
        return {
            status:200,
            data: {
                message: 'Successfully verified.Continue to password recovery',
                verificationToken
            }
        }
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return {
                status: 400,
                data: 'Invalid or expired verification token'
            };
        }
        console.error(err);
        return {
            status: 500,
            data: 'Internal server error'
        };
    }
};

       


export const PasswordRecovery = async (email) => {
    try {
        const userExite = await Users.findOne({ where: { email: email.trim().toLowerCase() } });
        if(!userExite){
            return { 
                status: 200,
                data: 'If the account exists, a recovery code was sent.' 
            };
        }
        const codeString = randomInt(100000, 1000000).toString();
        const hashedCode = await bcrypt.hash(codeString, 10);

        await userExite.update({
            verification_password: hashedCode,
            verification_sent_at: new Date(),
            verification_attempts: 0,
            verification_locked_until: null,
            password_reset_used_at: null
        });

        const result = await sendMail(userExite.email, 'שחזור סיסמה', `קוד אימות שלך הוא: ${codeString}`);
        if(result.status!=200){
            await userExite.update({
                verification_password: null,
                verification_sent_at: null,
                verification_attempts: 0,
                verification_locked_until: null
            });
            return { 
                status: 500, 
                data: 'Recovery request could not be completed' };
        }

        const verificationToken = jwt.sign({
            id: userExite.id,
            purpose: 'password-recovery-code'
            },
            process.env.JWT_SECRET,
            { 
            expiresIn: '10m'
        }
        );
        return {
            status:200,
            data: {
                message: 'If the account exists, a recovery code was sent.',
                verificationToken
            }
        }

    } catch (err) {
        console.error(err);
        return { status: 500, data: 'Internal server error' };
    }
};

export const resetPassword = async (newPassword, resetToken) => {
    try {
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        if (decoded.purpose !== 'password-reset' || !decoded.id) {
            return { status: 400, data: 'Invalid password reset token' };
        }

        const user = await Users.findByPk(decoded.id);
        if (!user || user.password_reset_used_at) {
            return { 
                status: 400,
                data: 'Invalid or expired password reset request' 
            };
        }

        await user.update({
            password: newPassword,
            password_reset_used_at: new Date(),
            verification_password: null,
            verification_sent_at: null,
            verification_attempts: 0,
            verification_locked_until: null
        });

        return { 
            status: 200,
            data: 'Password updated successfully'
        };

    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return { 
                status: 400,
                 data: 'Invalid or expired password reset request'
            };
        }
        console.error(err);
        return { 
            status: 500,
            data: 'Internal server error'
        };
    }
};



export const ipcounter = new Map();
const TIME_LIMIT_MS = 5 * 60 * 1000;

export const ipLimiter = (ip) => {
    const record = ipcounter.get(ip);

    if (record) {
        if (Date.now() - record.startTime > TIME_LIMIT_MS) {
            ipcounter.delete(ip);
            return {
                status: 200,
                data: 'OK'
            };
        }

        if (record.count >= 3) {
            return {
                status: 429,
                data: 'Too Many Requests. Try again later.'
            };
        }
    }

    return { 
        status: 200,
        data: 'OK'
    };
};


const incrementIpCount = (ip) => {
    const record = ipcounter.get(ip);

    if (!record) {
        ipcounter.set(ip, { count: 1, startTime: Date.now() });
    } else {
        ipcounter.set(ip, { count: record.count + 1, startTime: record.startTime });
    }
};

setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipcounter.entries()) {
        if (now - record.startTime > TIME_LIMIT_MS) {
            ipcounter.delete(ip);
        }
    }
}, 60 * 60 * 1000);


