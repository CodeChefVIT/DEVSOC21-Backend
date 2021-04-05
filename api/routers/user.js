const router = require("express").Router();

const user = require("../controllers/user");
const checkAuth = require("../middlewares/checkAuth");

router.patch("/update", checkAuth, user.update);

router.get("/getProfile",checkAuth, user.getProfile);

router.post('/sendInvite',checkAuth, user.sendInvite);

router.post('/joinInvite', user.join);

router.patch('/cancelInvite', checkAuth, user.cancelInvite)

module.exports = router;
