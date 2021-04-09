const schedule = require("node-schedule");
const User = require("../api/models/user");
var rule = new schedule.RecurrenceRule();

rule.minute = new schedule.Range(0, 59, 1);
console.log("hi");
schedule.scheduleJob(rule, async function () {
  try {
    const users = await User.find({
      otpExpiryTimestamp: { $lte: Date.now() },
    });
    for (let user of users) {
      console.log(user)
      await User.updateOne(
        { _id: user._id },
        {
          currentOtp: null,
          otpExpiryTimestamp: null,
          otpTimestamp: null,
          numOtpLogins: 0,
        }
      );
    }
    console.log("Job ran successfully");
  } catch (err) {
    console.log("Error in cron job", err.toString);
  }
});
