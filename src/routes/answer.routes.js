import { Router } from 'express';
import { submitAnswer, getSurveyAnalysis, submitanswerfortargetted, getCustomAnalysis, getRespondentdata, getAnswersforUser } from '../controllers/answers/answers.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js'
const router = new Router();

// Route to submit answers for a survey
router.post('/submitAnswer', submitAnswer);

router.post('/submitanswerfortargetted', submitanswerfortargetted)

// Route to get analysis for a specific question in a survey
router.get('/analysis/:surveyTitle/:surveyType/:surveyCategory', verifyJWT, requireAdmin, getSurveyAnalysis);

// // Route to get answers submitted by a specific user
// router.get('/userAnswers/:userId', verifyJWT, requireAdmin, getUserAnswers);

// Route to get analysis for a specific question in a survey
router.get('/getCustomAnalysis/:surveyTitle/:surveyType/:surveyCategory', verifyJWT, requireAdmin, getCustomAnalysis);

//Route to get respondent data
router.get('/getRespondentdata', verifyJWT, requireAdmin, getRespondentdata);

//Get Answer for 1 user
router.get('/getAnswersforUser', verifyJWT, requireAdmin, getAnswersforUser)

export default router;
