const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (!req.headers.authorization)
    return res.status(403).json({
      message: "Access Denied! No token entered.",
    });

  const token = req.headers.authorization.split(" ")[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;  
    console.log(req.user)
    if(req.user.lol=="lmao"){
    next();
    }
    else{
      return res.status(403).json({
        message:"Hackerman not allowed"
      })
    }
  } catch (err) {
    res.status(403).json({
      message: "Invalid token",
    });
  }
};
