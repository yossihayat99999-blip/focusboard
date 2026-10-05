const validateTextLength = (value, fieldName, min, max) => {
    if(typeof value !== 'string' || value.trim().length < min || value.trim().length > max){
        return `${fieldName} must be between ${min} and ${max} characters`;
    }
    return null;
};
const validateTitle = (title) => validateTextLength(title, 'Title', 2, 40);
const validatePhoneNumber =(number)=>{
    if(typeof number !== 'string' || number.trim().length < 9 || number.trim().length > 20 || !/^[0-9+()\-\s]+$/.test(number.trim())){
        return "A valid phone number is required";
    }

    return null;
};
const validateDueDate = (due_date) => {
    const dueDateTimestamp = typeof due_date === 'string' ? Date.parse(due_date) : NaN;

    if(isNaN(dueDateTimestamp)){
        return "A valid due date is required";
    }

    if(dueDateTimestamp < Date.now()){
        return "The date is old.";
    }

    return null;
};
const validatePositiveInteger = (id, fieldName) => {
    if(!Number.isInteger(id) || id < 1){
        return `${fieldName} must be a valid positive number`;
    }
    return null;
};
const validateBoolean = (value, fieldName) => {
    if(typeof value !== 'boolean'){
        return `${fieldName} must be a boolean`;
    }
    return null;
};
const validateName = (name)=>{
    return validateTextLength(name, 'Name', 2, 20);
};
const validateEmail = (email) => {
    if(typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){
        return "A valid email is required";
    }
    return null;
};
const validateUsername = (username) => {
    return validateTextLength(username, 'Username', 3, 30);
};
const validatePasswordLength = (password) => {
    if(typeof password !== 'string' || password.length < 12 || password.length > 72){
        return "Password is required and must be between 12 and 72 characters";
    }
    return null;
};
export const validateAssignment = (data)=>{
    const {title,course_id,due_date} = data || {};

    const titleError = validateTitle(title);
    if(titleError) return titleError;
    const idError = validatePositiveInteger(course_id, "course_id");
    if(idError) return idError;
    const dueDateError = validateDueDate(due_date);
    if(dueDateError) return dueDateError;

    return null
};
export const validateUpdateAssignment = (data)=>{
    const {title,due_date,is_completed} = data || {};

    if(title===undefined && due_date===undefined && is_completed===undefined ){
        return "At least one field is required";
    }

    if(title!==undefined){
        const titleError = validateTitle(title);
        if(titleError) return titleError;
    }

    if(due_date !== undefined){
        const dueDateError = validateDueDate(due_date);
        if(dueDateError) return dueDateError;
    }

    if(is_completed !== undefined ){
        const booleanError = validateBoolean(is_completed, "is_completed");
        if(booleanError) return booleanError;
    }

    return null;
};
export const validateRegister =(data)=>{
    const {username, password, email, number} = data || {};

    const usernameError = validateUsername(username);
    if(usernameError) return usernameError;

    const passwordError = validatePasswordLength(password);
    if(passwordError) return passwordError;

    const emailError = validateEmail(email);
    if(emailError) return emailError;
    
    const phoneError =validatePhoneNumber(number);

    if(phoneError) return phoneError;
    

    return null
};
export const isPassword = (data) => {
    const { password } = data || {};

    if (typeof password !== 'string') {
        return "Password is required and must be a string";
    }

    let upperCase = false;
    let lowerCase = false;
    let number = false;
    let char = false;

    const specialCharacters = [
        '!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
        '_', '+', '-', '=', '[', ']', '{', '}', ';', ':',
        ',', '.', '<', '>', '/', '?', '|', '\\', '~', '`'
    ];

    for (let i = 0; i < password.length; i++) {
        const digit = password[i];

        if (digit >= 'A' && digit <= 'Z') {
            upperCase = true;
        } else if (digit >= 'a' && digit <= 'z') {
            lowerCase = true;
        } else if (digit >= '0' && digit <= '9') {
            number = true;
        } else if (specialCharacters.includes(digit)) {
            char = true;
        }
    }

    if (!upperCase || !lowerCase || !number || !char) {
        return "The password must include uppercase and lowercase letters, a number, and a special character";
    }

    return null;
};
export const validateLecturer =(data)=>{
    const {name, email} = data || {};
    const nameError = validateName(name);
    if(nameError) return nameError;

    const emailError = validateEmail(email);
    if(emailError) return emailError;

    return null

};
export const validateCourse =(data)=>{
    const {name, lecturer_id} = data || {};

    const nameError = validateName(name);
    if(nameError) return nameError;

    const idError = validatePositiveInteger(lecturer_id, "lecturer_id");
    if(idError) return idError;
    return null
};
export const validateLogin =(data)=>{
    const {username, password} = data || {};
    if(username === undefined || password === undefined){
        return "username or password are required"
    }

    const usernameError = validateUsername(username);
    if(usernameError) return usernameError;

    const passwordError = validatePasswordLength(password);
    if(passwordError) return passwordError;

    return null
};
export const validateGetAssignment =(data)=>{
    const {course_id, is_completed} = data || {};

    if(course_id!== undefined){
        const parsedCourseId = Number(course_id);
        const idError = validatePositiveInteger(parsedCourseId, "course_id");
        if(idError) return idError;
    }

    if(is_completed !== undefined && is_completed !== 'true' && is_completed !== 'false'){
        return "is_completed must be true or false";
    }

    return null;
};
export const validateUpdateLecturer = (data) => {
    const { name, email } = data || {};

    if (name === undefined && email === undefined) {
        return "At least one field is required";
    }

    if (name !== undefined) {
        const nameError = validateName(name);
        if (nameError) return nameError;
    }

    if (email !== undefined) {
        const emailError = validateEmail(email);
        if (emailError) return emailError;
    }

    return null;
};

export const validateUpdateCourse = (data) => {
    const { name, lecturer_id } = data || {};

    if (name === undefined && lecturer_id === undefined) {
        return 'At least one field is required';
    }

    if (name !== undefined) {
        const nameError = validateName(name);
        if (nameError) return nameError;
    }

    if (lecturer_id !== undefined) {
        const idError = validatePositiveInteger(Number(lecturer_id), 'lecturer_id');
        if (idError) return idError;
    }

    return null;
};
export const validateId = (data) => {
    const { id } = data || {};
    const parsedId = Number(id);
    const idError = validatePositiveInteger(parsedId, "id");
    if (idError) return idError;

    return null;
};
export const verificationCode =(data)=>{
    const { code } = data || {};
    const codeString = String(code ?? '');

    if (!/^\d{6}$/.test(codeString)) {
        return 'Verification code must contain exactly 6 digits';
    }

    return null;
};

export const validatePasswordRecovery = (data) => {
    const emailError = validateEmail(data?.email);
    return emailError;
};

export const validatePasswordReset = (data) => {
    const passwordError = validatePasswordLength(data?.newPassword);
    if (passwordError) return passwordError;
    return isPassword({ password: data?.newPassword });
};
export const validateVerificationRequest = (data) => {
    const userId = Number(data?.userId);
    return validatePositiveInteger(userId, 'userId');
};