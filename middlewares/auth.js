import jwt from 'jsonwebtoken';

export const verifyToken = async (req,res,next)=>{
    const header = req.headers['authorization']
    if(!header){
      return res.status(401).json({ error: 'Authorization token is required' })
    }
    const authToken=header.split(" ")[1]
    if(!authToken){
       return res.status(401).json({ error: 'Access denied' })
    }
    try{
        const decoded= jwt.verify(authToken,process.env.JWT_SECRET);
        req.userId = decoded.id
        next()
   

    }catch(err){
       return  res.status(403).json({ error: 'Invalid token' });

    }
};
