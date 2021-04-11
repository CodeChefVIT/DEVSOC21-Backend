const router = require("express").Router();

const team = require("../controllers/team");
const checkAuth = require("../middlewares/checkAuth");

const recaptchaMiddleware = require("../middlewares/recaptchaVerification");

router.post("/make", checkAuth, recaptchaMiddleware, team.make);

router.post("/leave", checkAuth, recaptchaMiddleware, team.leave);

router.post("/join", checkAuth, recaptchaMiddleware, team.join);

router.get("/all", team.displayAll);

router.get("/one", team.displayOne);

router.patch("toggleFinalised", checkAuth, recaptchaMiddleware, team.finalise);

router.patch("/update", checkAuth, recaptchaMiddleware, team.update);

router.get("/user", checkAuth, team.getTeamByUser);

router.post("/removeUser", checkAuth, recaptchaMiddleware, team.removeUser);

router.post('/saveIdea', checkAuth, team.saveIdea);

module.exports = router;
