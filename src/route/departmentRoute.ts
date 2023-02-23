import express, { application, NextFunction ,Request,Response} from 'express'
import { addNewDepartment,deleteScheme, deleteDepartment, getAllDepartment, getAllDepartmentAndScheme, getDepartmentById, getSchemeByDepartment, updateDepartment,  uploadExcelData, uploadSchemeData, updateQuestion } from '../controller/deptController';
import { upload } from '../middleware/auth';
import {checkRole} from '../utils/user-auth'
const router = express.Router();
router.post('/adddepartment', addNewDepartment)
router.post('/uploadexceldata',upload, uploadExcelData)
router.post('/uploadexceldataforscheme', upload,uploadSchemeData)
router.post('/updatedepartment/:id', updateDepartment)
router.post('/updatequestion/:id', updateQuestion)
router.get('/getalldepartmentandscheme', getAllDepartmentAndScheme)
router.delete('/deletedepartmentbyid/:id', deleteDepartment)
router.delete('/deleteschemefromdept/:id/:schemename', deleteScheme)
router.post('/getdepartmentbyid/:id', getDepartmentById)
router.get('/getalldepartment', getAllDepartment)
router.get('/getallschemebydepartment/:id', getSchemeByDepartment)



export default router;