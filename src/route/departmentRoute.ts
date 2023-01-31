import express, { application, NextFunction ,Request,Response} from 'express'
import { addNewDepartment, deleteDepartment, getAllDepartment, getAllDepartmentAndScheme, getDepartmentById, getSchemeByDepartment, updateDepartment } from '../controller/deptController';
import {checkRole} from '../utils/user-auth'
const router = express.Router();

router.post('/adddepartment', addNewDepartment)
router.post('/updatedepartment/:id', updateDepartment)
router.get('/getalldepartmentandscheme', getAllDepartmentAndScheme)
router.delete('/deletedepartmentbyid/:id', deleteDepartment)
router.post('/getdepartmentbyid/:id', getDepartmentById)
router.get('/getalldepartment', getAllDepartment)
router.get('/getallschemebydepartment/:id', getSchemeByDepartment)



export default router;