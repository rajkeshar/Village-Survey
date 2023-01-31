import express, { application } from 'express'
import homepageController from '../controller/homepgeController';
import loginRoute from './userRoute'
const router = express.Router();
const app = express();

router.get('/home',homepageController);
app.use('/user',loginRoute)


export default router;