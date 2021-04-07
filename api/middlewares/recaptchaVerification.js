const request = require("request");
const recaptchaVerification = async (req, res, next) => {
  if(!req.body.captcha){
    return res.status(421).json({
      success: false,
      message: "captcha not present",
    });
  }
  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${req.body.captcha}`;
  request(verifyURL, (err, response, body) => {
    body = JSON.parse(body);
    console.log(err);
    console.log(body);
    try {
      if (!body.success || body.score < 0.4) {
        flag = 1;
        return res.status(420).json({
          success: false,
          message: "Something went wrong",
        });
      }
      if (err) {
        return res.status(422).json({
          success: false,
          message: err.toString(),
        });
      }
      next()
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: err,
      });
    }
  });
};

module.exports = recaptchaVerification;
