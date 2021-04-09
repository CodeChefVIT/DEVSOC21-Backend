const router = require("express").Router();

const team = require("../controllers/team");
const checkAuth = require("../middlewares/checkAuth");
const checkAdmin = require("../middlewares/checkAdmin")
const admin = require("../controllers/admin")

router.post('/login',admin.login)

router.get("/all", checkAdmin, admin.displayAll);

router.get("/id",checkAdmin,admin.submissionById)

router.get("/name",checkAdmin,admin.submissionByName)

router.patch("/status",checkAdmin,admin.submissionStatus)

module.exports = router
