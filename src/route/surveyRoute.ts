import express, { application, NextFunction ,Request,Response} from 'express'
import { addNewSurvey,surveyChart,topRankingVilagesDataForPublice,getPubliceSurveyData,publiceSurveyData,topRankingVilaagesElseQuestion,getSurveyStatus,getSurveyStatusById,checkMatrix,isOnGoingSurveyTrue,progressDetailofSurvey, changeSurveyStatusToFalse,changeSurveyStatus, getSurveyDateRange,deleteSurvey, getAllSurvey,  getSurveyById, updateNewSurvey, submitSurvey, monthlySurveyCompleted, getInspectionsDetails, getScoreBiseRank, getDashBoardDetail,departmantQuestionRankData,topRankingVilaages,topRankingDepartmants, getHighScoreVillage } from '../controller/inspectionController';
import {checkRole} from '../utils/user-auth'
const router = express.Router();

router.post('/addnewsurvey', addNewSurvey)
router.post('/updatesurvey/:id', updateNewSurvey)
router.get('/getsurveybyid/:id', getSurveyById)
router.get('/changesurveystatus/:id', changeSurveyStatus)
router.get('/changeSurveyStatusToFalse/:id', changeSurveyStatusToFalse)

router.get('/getallsurveylist', getAllSurvey)
router.post('/deletesurey/:id', deleteSurvey)
router.get('/getsurveydate', getSurveyDateRange)
router.post('/submitsurvey/:id', submitSurvey)
router.post('/monthlySurveyCompleted/:mon', monthlySurveyCompleted)
router.get('/isongoingsurveytrue', isOnGoingSurveyTrue)
router.get('/inspectiondetails/:id/:email', getInspectionsDetails)
router.get('/getrankbisescore/:surveyId', getScoreBiseRank)
router.get('/getprogressdetailofsurvey/:surveyId', progressDetailofSurvey)
router.get('/getdashboarddetail/:surveyId', getDashBoardDetail)
router.get('/gethighscore/:surveyId', getHighScoreVillage)
router.post('/topRankingVilaages/:id',topRankingVilaages)
router.get('/topRankingVilaagesElseQuestion/:id',topRankingVilaagesElseQuestion)

router.get('/topRankingVilaagesPubliceData/:id',topRankingVilagesDataForPublice)

router.post('/topRankingDepartmantVillages/',topRankingDepartmants)
router.post('/questionList/',departmantQuestionRankData)
router.get('/checkMatrix/',checkMatrix)
router.get('/checkSurveyStatus/', getSurveyStatus)
router.get('/checkSurveyStatus/:id', getSurveyStatusById)
router.post('/publiceSurveyData',publiceSurveyData)
router.get('/getPubliceSurveyData',getPubliceSurveyData)
router.get('/surveyChart',surveyChart)








export default router;