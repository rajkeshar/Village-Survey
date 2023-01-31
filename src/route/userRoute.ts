import express, { application, NextFunction ,Request,Response} from 'express'
import {checkRole} from '../utils/user-auth'
import { deleteUser, forgetPassword, logIn, loginSuperAdmin, signUp, superAdminRegister, updateUser, validateUserEmail, verifyOTP} from '../controller/userController';
const router = express.Router();

router.post('/register-superadmin', superAdminRegister)
router.post('/login-superadmin', loginSuperAdmin)
router.get('/login-superadmin/verify/:id/:token', validateUserEmail)

// router.post('/signup',signUp);
// router.post('/signup/verifyotp',verifyOTP);
// router.post('/register-user', (req:any,res:Response,next:NextFunction)=>{ checkRole(req,res,next,['superadmin'])},superAdminRegister)
router.post('/register-user', signUp)
router.post('/login',logIn);
router.post('/login/verifyotp',verifyOTP);

router.post('/resetpassword', forgetPassword)
router.delete('/deleteuser/:id',  deleteUser)
router.post('/updateuser/:id',  updateUser)


export default router;