const express = require("express");
const app = express();
const path = require('path');
const port = 1234; 
const { google } = require("googleapis");
const request = require("request");
const cors = require("cors");
const urlParse = require("url-parse");
const queryParse = require("query-string");
const bodyParser = require("body-parser");
const axios = require("axios"); 
var date = new Date(); // today's date and time in ISO format
var today = Date.parse(date);
var d = new Date();
d.setDate(d.getDate() - 5);
var yesterday=Date.parse(d);
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
                    bucketByTime: {durationMillis: 86400000 },
                    startTimeMillis: yesterday,
                    endTimeMillis: today,
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
                        //console.log(value)
                        for (const i of value.value) {
                            var test=i.intVal;
                            console.log(test);
                            if(test>20){
                                res.sendFile(path.join(__dirname, 'pages/fit.html'));
                            }
                            else{
                                res.sendFile(path.join(__dirname, 'pages/unfit.html'));
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }
});t

app.listen(port, () => console.log(`GOOGLE FIT IS LISTENING ON PORT ${port}`));