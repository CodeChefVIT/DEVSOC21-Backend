const schedule = require("node-schedule");
const User = require("../api/models/user");
const aws = require("aws-sdk");
const Team = require("../api/models/team");
const ReviewOne = require("../api/models/ReviewOne");
var rule = new schedule.RecurrenceRule();
const fs = require('fs');




console.log('This is after the write call');

rule.hour = new cron.Range(0,23,1);
rule.minute = 0;
schedule.scheduleJob(rule, async function(){
    let users = await User.find({})
  users = JSON.stringify(users)
    fs.writeFile('user.json', users, (err) => {
      if (err) throw err;
      console.log('Data written to file');
      uploadToS3()
  });
});

const uploadToS3 = async () => {
  aws.config.update({
    accessKeyId: process.env.AWS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS,
  });

  var s3 = new aws.S3();

  fs.readFile('user.json', (err, data) => {
    if (err) throw err;
    const params = {
        Bucket: process.env.AWS_S3_BUCKET, // pass your bucket name
        Key: `backup/user_${Date.now()}.json`, // file will be saved as testBucket/contacts.csv
        Body: data,
        ACL: "public-read",
    };
    s3.upload(params, function(s3Err, data) {
        if (s3Err) throw s3Err
        console.log(`File uploaded successfully at ${data.Location}`)
    });
 });
};
