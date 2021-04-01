const router = require("express").Router();

const team = require("../controllers/team");
const checkAuth = require("../middlewares/checkAuth");

router.post("/make", checkAuth, team.make);

router.post("/leave", checkAuth, team.leave);

router.post("/join", checkAuth, team.join);

router.get("/all", team.displayAll);

router.get("/one", team.displayOne);

router.patch("toggleFinalised", checkAuth, team.finalise);

router.patch("/update", checkAuth, team.update);

router.get("/user",checkAuth,team.getTeamByUser)
module.exports = router;
