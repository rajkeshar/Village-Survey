import express, { application, NextFunction ,Request,Response} from 'express'
import {checkRole} from '../utils/user-auth'
import { getUserById,deleteUser, forgetPassword,departmentAssignmentForSurveyor, logIn,getAllUser, loginSuperAdmin, signUp, superAdminRegister, updateUser,  verifyOTP, makeInspectoreProfile, villageAssignmentForSurveyor, checkDuplicateDeparmentAssignInVillage, getUserAssignedVillageAndDepartment, pullVillageFromSurveyor, pullDepartmentsFromSurveyor, getAssignVillageName} from '../controller/userController';
import { authenticateToken } from '../middleware/auth';
const router = express.Router();

router.post('/register-superadmin', superAdminRegister)
router.post('/login-superadmin', loginSuperAdmin)
router.post('/login',logIn);
// router.get('/login-superadmin/verify/:id/:token', validateUserEmail)

// router.post('/signup',signUp);
// router.post('/register-user', (req:any,res:Response,next:NextFunction)=>{ checkRole(req,res,next,['superadmin'])},superAdminRegister)
router.post('/register-user', signUp)

router.post('/sendotp', forgetPassword)
router.post('/resetpassword/verifyotp', verifyOTP)

router.delete('/deleteuser/:id', deleteUser)
router.get('/getuser/:id', getUserById)
router.get('/getvillagename/:id', getAssignVillageName)
router.post('/updateuser/:id',  updateUser)
router.get('/getalluser',  getAllUser)
router.post('/villageassignmentofsurveyor/:id',  villageAssignmentForSurveyor)
router.post('/deptassignmentofsurveyor/:id',  departmentAssignmentForSurveyor)
router.post('/makeinspectoretouser/:id',  makeInspectoreProfile)
router.post('/checkmatrix',  checkDuplicateDeparmentAssignInVillage)
router.get('/getuservillageanddept/:id',  getUserAssignedVillageAndDepartment)
router.post('/deselectvillagefromuser/:id',  pullVillageFromSurveyor)
router.post('/deselectdeptfromuser/:id',  pullDepartmentsFromSurveyor)


export default router;