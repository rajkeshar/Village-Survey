import express, { application, NextFunction ,Request,Response} from 'express'
import { addNewZone, addNewVillage, deleteZone, getAllBlocks, getAllDistrict, getAllVillage, getZoneById, updateZone, getAllZone, deleteBlockOrVillage } from '../controller/zoneController';
import {checkRole} from '../utils/user-auth'
const router = express.Router();

router.post('/addnewzone', addNewZone)
router.post('/addnewvillage/:id', addNewVillage)
router.post('/updatezone/:id', updateZone)
router.get('/getzonebyid/:id', getZoneById)
router.delete('/deletezone/:id', deleteZone)
router.post('/deletebockorvillage/:id/:block', deleteBlockOrVillage)
router.get('/getallvillage/:distId/:blockId', getAllVillage)
router.get('/getallblock/:distId', getAllBlocks)
router.get('/getalldistrict', getAllDistrict)
router.get('/getallzone', getAllZone)



export default router;