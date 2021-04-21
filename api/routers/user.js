const router = require("express").Router();

const user = require("../controllers/user");
const checkAuth = require("../middlewares/checkAuth");

const recaptchaMiddleware = require('../middlewares/recaptchaVerification')

router.patch("/update", checkAuth, recaptchaMiddleware, user.update);

router.get("/getProfile",checkAuth, user.getProfile);

router.post('/sendInvite',checkAuth, recaptchaMiddleware, user.sendInvite);

router.post('/joinInvite', recaptchaMiddleware, user.join);

router.patch('/cancelInvite', checkAuth, recaptchaMiddleware, user.cancelInvite)

router.get('/notInTeam',user.notInTeam)
// router.get('/sendFCM', user.sendFCM)

module.exports = router;
