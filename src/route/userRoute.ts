import express, { application, NextFunction ,Request,Response} from 'express'
import {checkRole} from '../utils/user-auth'
import { getUserById,deleteUser, forgetPassword, logIn,getAllUser, loginSuperAdmin, signUp, superAdminRegister, updateUser,  verifyOTP} from '../controller/userController';
import { authenticateToken } from '../middleware/auth';
const router = express.Router();

router.post('/register-superadmin', superAdminRegister)
router.post('/login-superadmin', loginSuperAdmin)
router.post('/login',logIn);
// router.get('/login-superadmin/verify/:id/:token', validateUserEmail)

// router.post('/signup',signUp);
// router.post('/register-user', (req:any,res:Response,next:NextFunction)=>{ checkRole(req,res,next,['superadmin'])},superAdminRegister)
router.post('/register-user',authenticateToken, signUp)

router.post('/resetpassword', forgetPassword)
router.post('/resetpassword/verifyotp', verifyOTP)

router.delete('/deleteuser/:id', deleteUser)
router.get('/getuser/:id', getUserById)
router.post('/updateuser/:id',  updateUser)
router.get('/getalluser',  getAllUser)


export default router;