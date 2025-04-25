import { Router } from 'express'
import { newsurvey, newSurveyquestion, setSurveyOpenClose, deleteSurvey } from '../controllers/Survey/survey.controller.js'
import { getSurveyById } from '../controllers/Survey/survey.controller.js'
import { getLocation } from '../controllers/Survey/getLocation.controller.js'
import { deleteSurveyQuestion } from '../controllers/Survey/deleteSurveyQuestion.controller.js'
import { updateQuestion } from '../controllers/Survey/updateQuestioninSurvey.controller.js'
// import { verifyJWT } from '../middlewares/auth.middleware.js';
// import { requireAdmin } from '../middlewares/role.middleware.js'

const router = new Router()


//Route to create new survey
router.post('/survey',  newsurvey, newSurveyquestion);

//Route to get survey
router.get("/getSurvey", getSurveyById)

//Router to delete surveyQuestion
router.delete('/deletequestion/:id', deleteSurveyQuestion)

//Router to update surveyQuestion in the survey
router.put('/updateQuestion', updateQuestion)

//Router to open or close the survey
router.post('/setSurveyOpenClose', setSurveyOpenClose)

router.delete('/deletesurvey', deleteSurvey)

router.get('/getLocation', getLocation)


export default router