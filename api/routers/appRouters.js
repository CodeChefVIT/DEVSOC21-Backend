const router = require("express").Router();

const app = require("../controllers/appController");
const checkAuth = require("../middlewares/checkAuth");

// const recaptchaMiddleware = require("../middlewares/recaptchaVerification");

router.post("/getOtp", app.getAppOTP);

router.post("/checkOtp", app.checkAppOTP);

router.get("/getProfile", checkAuth, app.getAppProfile);

router.get("/getAnnouncements", app.getAnnouncements);

router.post('/changeAnnouncements', app.changeAnnouncements);

router.get('/getForm', app.getForm)

router.post('/submitForm', checkAuth, app.submitform)

module.exports = router;