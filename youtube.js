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
             "https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.oxygen_saturation.read2 profile email openid"
            ];

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
                    aggregateBy: [
                        {
                            dataTypeName: "com.google.heart_rate.bpm",
                            dataSourcesId: "dervived:com.google.heart_rate.bpm:com.google.heart_rate.bpm"
                        },
                    ],
                    bucketByTime: {durationMillis: 86400000 },
                    startTimeMillis: 1585785599000,
                    endTimeMillis: 1585958399000,
                },
        });

        stepArray = result.data.bucket
        } catch (e) {
            console.log(e)
        }
        try {
            for (const dataset of stepArray) {
                console.log(dataset);
            }
        } catch (e) {
            console.log(e)
        }
});

app.listen(port, () => console.log(`GOOGLE FIT IS LISTENING ON PORT ${port}`));

