const schedule = require("node-schedule");
const aws = require("aws-sdk");
const User = require("../api/models/user");
const Team = require("../api/models/team");
var rule = new schedule.RecurrenceRule();
const fs = require('fs');




console.log('This is after the write call');

rule.hour = new cron.Range(0,23,1);
rule.minute = 0;
schedule.scheduleJob(rule, async function(){
    let teams = await Team.find({})
    teams = JSON.stringify(teams)
    fs.writeFile('team.json', teams, (err) => {
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

  fs.readFile('team.json', (err, data) => {
    if (err) throw err;
    const params = {
        Bucket: process.env.AWS_S3_BUCKET, // pass your bucket name
        Key: `backup/team_${Date.now()}.json`, // file will be saved as testBucket/contacts.csv
        Body: data,
        ACL: "public-read",
    };
    s3.upload(params, function(s3Err, data) {
        if (s3Err) throw s3Err
        console.log(`File uploaded successfully at ${data.Location}`)
    });
 });
};