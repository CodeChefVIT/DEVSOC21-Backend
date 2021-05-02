const aws = require("aws-sdk")
const fs = require("fs")
require('dotenv').config({
  path: '../.env',
});

const csv = require('csv-parser');
const { result } = require("lodash");



results =[]
fs.createReadStream('teams.csv')
    .pipe(csv())
    .on('data', (data) => { results.push(data) })
    .on('end', async () => {
        // console.log(results.length)

          for(i=5600;i<5785;i++){
              if(results[i].email){
                // sendMail(results[i].email)

              }
                // console.log(results[i].email)
      }
    },
  )