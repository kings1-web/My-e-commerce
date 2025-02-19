const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
require("dotenv/config");
dotenv.config()



const authenticateUser=(req, res, next)=>{
const token=req.headers.authorization?.split(" ")[1];

if(!token) return res.status(401).json({message:"Unauthorized"});

try{
    const decoded=jwt.verify(token, process.env.secret);
    req.user=decoded;
    next();
}catch(error){
    res.status(403).json({message: "Invalid Token"})
}
};

  module.exports=authenticateUser