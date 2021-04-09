const router = require("express").Router();

const app = require("../controllers/appController");
const checkAuth = require("../middlewares/checkAuth");

// const recaptchaMiddleware = require("../middlewares/recaptchaVerification");

router.post("/getOtp", app.getAppOTP);

router.post("/checkOtp", app.checkAppOTP);


module.exports = router;
