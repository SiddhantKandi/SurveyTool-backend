import { Router } from 'express'
import {targetteduser,sendemailtorespondets,sendremindertorespondents} from '../controllers/User/addTargettedandrespondent.controller.js'
import {getUsers} from '../controllers/User/showusersforTargettedsurvey.controller.js'
// import { verifyJWT } from '../middlewares/auth.middleware.js'
// import {requireAdmin} from '../middlewares/role.middleware.js'

const router = Router()


//Router to save targetted users
router.route("/targetteduser").post(targetteduser)

//Router to send email to respondets
router.route("/sendemailtorespondets/:surveyTitle/:surveyType/:surveyCategory").post(sendemailtorespondets)

//Router to get targeted users
router.route("/getusers").get(getUsers)

//Router to just send reminder to respondets
router.route("/sendremindertorespondents/:surveyTitle/:surveyType/:surveyCategory").post(sendremindertorespondents)


export default router