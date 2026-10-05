export const validate = (validatorFunction, source = 'body') => {
    return (req, res, next) => {
        const error = validatorFunction(req[source]);
        if(error){
            return res.status(400).json({error})
        }
        next()
    }
};
      
    

