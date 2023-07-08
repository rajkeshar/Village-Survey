import express, { application, NextFunction ,Request,Response} from 'express'
import { addNewZone,updateTaluka, addNewVillage, deleteZone, getAllBlocks, getAllDistrict, getAllVillage, getZoneById,
     updateZone, getAllZone, deleteBlockOrVillage, getCountOfAllVillage, getCountOfAllBlocks, addNewTaluka, 
     getAllTaluka, getAllVillageBasedOnTalukId, getBlockById, uploadZoneData,  isVillageDisbaleTrue,getRemainingVillageFromAssignment, getAllTalukaList, searchVillageName } from '../controller/zoneController';
import { upload,uploadVillage } from '../middleware/auth';
import {checkRole} from '../utils/user-auth'
const router = express.Router();

router.post('/addnewzone', addNewZone)
router.post('/addnewtaluka/:id', addNewTaluka)
router.post('/addnewvillage/:id', addNewVillage)
router.post('/updatezone/:id', updateZone)
router.post('/updateTaluka/:id',updateTaluka)
router.get('/getzonebyid/:id', getZoneById)
router.delete('/deletezone/:id', deleteZone)
router.post('/deletebockorvillage/:id/:block', deleteBlockOrVillage)
router.get('/getallvillage', getAllVillage)
router.get('/getallvillagebasedontalukId/:id/:blockUniqueId/:talukaUniqueId', getAllVillageBasedOnTalukId)
router.get('/getallblock/:distId', getAllBlocks)
router.get('/getalltaluka/:distId', getAllTaluka)
router.get('/getalldistrict', getAllDistrict)
router.get('/getallzone', getAllZone)
router.get('/getallvillagecount', getCountOfAllVillage)
router.get('/getallblockcount', getCountOfAllBlocks)
router.get('/getblockbyid/:id/:blockUniqueId', getBlockById)
router.post('/uploadexcelvillage',uploadVillage, uploadZoneData)
router.post('/villagedisable/:id', isVillageDisbaleTrue)
router.get('/getalltaluka', getAllTalukaList)
router.get('/getallremainingvilage', getRemainingVillageFromAssignment)
router.get('/villagesearch/:searchquery', searchVillageName)



export default router;