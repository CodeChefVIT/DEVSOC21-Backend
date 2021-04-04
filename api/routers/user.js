const router = require("express").Router();

const user = require("../controllers/user");
const checkAuth = require("../middlewares/checkAuth");

router.patch("/update", checkAuth, user.update);

router.get("/getProfile",checkAuth, user.getProfile);

module.exports = router;
