import { Router } from 'express'
import { newsurvey, newSurveyquestion, setSurveyOpenClose, deleteSurvey } from '../controllers/Survey/survey.controller.js'
import { getSurveyById } from '../controllers/Survey/survey.controller.js'
import { getLocation } from '../controllers/Survey/getLocation.controller.js'
import { deleteSurveyQuestion } from '../controllers/Survey/deleteSurveyQuestion.controller.js'
import { updateQuestion } from '../controllers/Survey/updateQuestioninSurvey.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js'

const router = new Router()


//Route to create new survey
router.post('/survey', verifyJWT, requireAdmin, newsurvey, newSurveyquestion);

//Route to get survey
router.get("/getSurvey", getSurveyById)

//Router to delete surveyQuestion
router.delete('/deletequestion/:id', verifyJWT, requireAdmin, deleteSurveyQuestion)

//Router to update surveyQuestion in the survey
router.put('/updateQuestion', verifyJWT, requireAdmin, updateQuestion)

//Router to open or close the survey
router.post('/setSurveyOpenClose', verifyJWT, requireAdmin, setSurveyOpenClose)

router.delete('/deletesurvey', verifyJWT, requireAdmin, deleteSurvey)

router.get('/getLocation', getLocation)


export default router