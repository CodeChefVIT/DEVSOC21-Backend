const router = require("express").Router();

const team = require("../controllers/team");
const checkAuth = require("../middlewares/checkAuth");

const recaptchaMiddleware = require("../middlewares/recaptchaVerification");
const { upload } = require("../middlewares/s3UploadClient");

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

router.post('/saveIdea', checkAuth, team.saveIdea);

router.post('/finalSubmission', checkAuth, team.finalSubmission);

router.post('/uploadZip', checkAuth, upload.single("zip"), team.uploadFinalZip)

module.exports = router;
