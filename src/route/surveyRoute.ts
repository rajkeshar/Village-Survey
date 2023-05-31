import express, { application, NextFunction ,Request,Response} from 'express'
import { addNewSurvey,isOnGoingSurveyTrue,progressDetailofSurvey, changeSurveyStatus, getSurveyDateRange,deleteSurvey, getAllSurvey,  getSurveyById, updateNewSurvey, submitSurvey, monthlySurveyCompleted, getInspectionsDetails, getScoreBiseRank, getDashBoardDetail,topRankingVilaages,topRankingDepartmants, getHighScoreVillage } from '../controller/inspectionController';
import {checkRole} from '../utils/user-auth'
const router = express.Router();

router.post('/addnewsurvey', addNewSurvey)
router.post('/updatesurvey/:id', updateNewSurvey)
router.get('/getsurveybyid/:id', getSurveyById)
router.get('/changesurveystatus/:id', changeSurveyStatus)
router.get('/getallsurveylist', getAllSurvey)
router.post('/deletesurey/:id', deleteSurvey)
router.post('/getsurveydate', getSurveyDateRange)
router.post('/submitsurvey/:id', submitSurvey)
router.post('/monthlySurveyCompleted/:mon', monthlySurveyCompleted)
router.get('/isongoingsurveytrue', isOnGoingSurveyTrue)
router.get('/inspectiondetails/:id/:email', getInspectionsDetails)
router.get('/getrankbisescore/:surveyId', getScoreBiseRank)
router.get('/getprogressdetailofsurvey/:surveyId', progressDetailofSurvey)
router.get('/getdashboarddetail/:surveyId', getDashBoardDetail)
router.get('/gethighscore/:surveyId', getHighScoreVillage)
router.post('/topRankingVilaages/',topRankingVilaages)
router.post('/topRankingDepartmantVillages/',topRankingDepartmants)



export default router;