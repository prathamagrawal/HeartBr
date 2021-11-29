const express = require("express");
const app = express();
const port = 1234;
const { google } = require("googleapis");
const request = require("request");
const cors = require("cors");
const urlParse = require("url-parse");
const queryParse = require("query-string");
const bodyParser = require("body-parser");
const axios = require("axios"); 

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = String(today.getYear());
var yesterday = new Date()

today = (mm) + '/' + (dd) + '/' + (yyyy);
yesterday = (mm-2)+ '/' + (dd) + '/' + (yyyy);
var todayDate = new Date(today);
var todayresult = todayDate.getTime();
var yesterdayDate = new Date(yesterday);
var yesterdayresult = yesterdayDate.getTime();

// 588017612151-kjdgmot8rlumnfrl8fo9nto306moad08.apps.googleusercontent.com
// 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

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/getURLting", (req, res) => {
    const oauth2Client = new google.auth.OAuth2(
        //clint id
        "588017612151-kjdgmot8rlumnfrl8fo9nto306moad08.apps.googleusercontent.com",
        //client secret key
        "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",
        // link to redirect
        "http://localhost:1234/steps"
    )
        const scopes = [
             "https://www.googleapis.com/auth/fitness.activity.read profile email openid"]

        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",
            scope: scopes,
            state: JSON.stringify({
                callbackUrl: req.body.callbackUrl,
                userID:req.body.userid
            })
        });

        request(url, (err, response, body) => {
            console.log("error: ",err);
            console.log("Status code: ",response && response.statusCode);
            res.send({ url });
        });
});

app.get("/steps", async (req, res) => {
    const queryURL =  new urlParse(req.url);
    const code = queryParse.parse(queryURL.query).code;
    const oauth2Client = new google.auth.OAuth2(
        //clint id
        "588017612151-kjdgmot8rlumnfrl8fo9nto306moad08.apps.googleusercontent.com",
        //client secret key
        "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",
        // link to redirect
        "http://localhost:1234/steps"
    );
    const tokens = await oauth2Client.getToken(code);

        res.send("Hello");
        
        let stepArray = [];

        try {
            const result = await axios({
                method: "POST",
                headers: {
                    authorization: "Bearer " + tokens.tokens.access_token
                }, 
                "Content-Type": "application/json",
                url: `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
                data: {
                    "aggregateBy": [{
                            "dataTypeName": "com.google.heart_minutes"
                        }],
                    bucketByTime: {durationMillis: 604800000 },
                    startTimeMillis: 1638031173505,
                    endTimeMillis: 1638117573505,
                },
        });

        stepArray = result.data.bucket
        } catch (e) {
            console.log(e)
        }
        try {
            for (const dataset of stepArray) {
                //console.log(dataset);
                for (const points of dataset.dataset) {
                    //console.log(points);
                    for (const value of points.point) {
                        console.log(value)
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }
});

app.listen(port, () => console.log(`GOOGLE FIT IS LISTENING ON PORT ${port}`));

