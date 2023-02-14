import express from 'express'; 
import * as dotenv from 'dotenv'
import cors from 'cors';
import indexRout from './route/indexroute'
import userRoute from './route/userRoute';
import deptRoute from './route/departmentRoute';
import rankRoute from './route/rankRoute';
import zoneRoute from './route/zoneRoute';
import surveyRoute from './route/surveyRoute';
import notification from './route/notificationRoute';
import connectDB from './config/db';
import path from 'path';
const app = express();
dotenv.config()

// const ket = {
//     "subject": "mailto: <nidhisharma050798@gmail.com>",
const publicKey = 'BEzgRTwwy8I4wF4_fLv39ow9_W3KPQTlweK39uvDsPkPXTBbkSIFXdBCEzy5PFWn782VRHWGpJTgDYb7hD6Lv9g';

const privateKey= 'hNxCEaebYkqpV-5w6mdYV_FxN_JLQ6YDqAbvqsVIX5U';
    // }

    // We will store our client files in ./client directory.
app.use(express.static(path.join(__dirname, "client")))

const port = process.env.PORT;
const mongoDBURL = process.env.MONGOURI;
connectDB(mongoDBURL).then((res) =>{
    console.log(res);
})
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}));
app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use('/api',indexRout);
app.use('/api/user',userRoute)
app.use('/api/dept',deptRoute)
app.use('/api/rank',rankRoute)
app.use('/api/zone',zoneRoute)
app.use('/api/survey',surveyRoute)
app.use('/api/noti',notification)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')('AC4930aa28ae1eda4956dcf43b2c781b03', '8f14ed8950c39eadb705bc0ed92f1943');


app.listen(port , () => {
    console.log(`server started on ${port}`)
})