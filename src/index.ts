import express from 'express'; 
import * as dotenv from 'dotenv'
import cors from 'cors';
import userRoute from './route/userRoute';
import deptRoute from './route/departmentRoute';
import zoneRoute from './route/zoneRoute';
import surveyRoute from './route/surveyRoute';
import notification from './route/notificationRoute';
import connectDB from './config/db';
import path from 'path';
const app = express();
dotenv.config()

    // We will store our client files in ./client directory.
app.use(express.static(path.join(__dirname, "client")))

const port = process.env.PORT;
const mongoDBURL = "mongodb+srv://ankushsss:756624@cluster0.rmop2.mongodb.net/?retryWrites=true&w=majority";
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
app.use('/api/user',userRoute)
app.use('/api/dept',deptRoute)
app.use('/api/zone',zoneRoute)
app.use('/api/survey',surveyRoute)
app.use('/api/noti',notification)



app.listen(port , () => {
    console.log(`server started on ${port}`)
})