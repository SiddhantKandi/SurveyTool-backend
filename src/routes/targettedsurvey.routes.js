import { Router } from 'express'
import {targetteduser,sendemailtorespondets,sendremindertorespondents} from '../controllers/User/addTargettedandrespondent.controller.js'
import {getUsers} from '../controllers/User/showusersforTargettedsurvey.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'
import {requireAdmin} from '../middlewares/role.middleware.js'

const router = Router()


//Router to save targetted users
router.route("/targetteduser").post(verifyJWT,requireAdmin,targetteduser)

//Router to send email to respondets
router.route("/sendemailtorespondets/:surveyTitle/:surveyType/:surveyCategory").post(verifyJWT,requireAdmin,sendemailtorespondets)

//Router to get targeted users
router.route("/getusers").get(verifyJWT,requireAdmin,getUsers)

//Router to just send reminder to respondets
router.route("/sendremindertorespondents/:surveyTitle/:surveyType/:surveyCategory").post(verifyJWT,requireAdmin,sendremindertorespondents)


export default router