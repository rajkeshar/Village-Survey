import express, { application, NextFunction ,Request,Response} from 'express'
import { addNewDepartment,deleteScheme, deleteDepartment, getAllDepartment, getAllDepartmentAndScheme, getDepartmentById, getSchemeByDepartment, updateDepartment,   uploadSchemeData, updateQuestion, getQuestionnaireByDepartment, fetchDepartmentListById, deleteQuestion, disableDepartmentById } from '../controller/deptController';
import { upload } from '../middleware/auth';
import {checkRole} from '../utils/user-auth'
const router = express.Router();
router.post('/adddepartment', addNewDepartment)
// router.post('/uploadexceldata',upload, uploadExcelData)
router.post('/uploadexceldataforscheme', upload,uploadSchemeData)
router.post('/updatedepartment/:id', updateDepartment)
router.post('/updateoraddquestion/:id', updateQuestion)
router.get('/getalldepartmentandscheme', getAllDepartmentAndScheme)
router.delete('/deletedepartmentbyid/:id', deleteDepartment)
router.delete('/deleteschemefromdept/:id/:schemeId', deleteScheme)
router.post('/getdepartmentbyid/:id', getDepartmentById)
router.get('/getalldepartment', getAllDepartment)
router.get('/getallschemebydepartment/:id', getSchemeByDepartment)
router.post('/getquestionnairbyscheme', getQuestionnaireByDepartment)
router.post('/fetchdeptlistbyids', fetchDepartmentListById)
router.delete('/deletequestion/:id/:schemeId/:questionId', deleteQuestion)
router.post('/disabledepartment/:id', disableDepartmentById)



export default router;