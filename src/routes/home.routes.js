import { Router } from 'express'
import {getHomedata} from '../controllers/Home/home.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {requireAdmin} from '../middlewares/role.middleware.js'

const router = Router()

//Route to get data to show in home

router.get('/getdata',verifyJWT,requireAdmin,getHomedata)


export default router