import { Router } from 'express';
import { submitAnswer, getSurveyAnalysis, submitanswerfortargetted, getCustomAnalysis, getRespondentdata, getAnswersforUser } from '../controllers/answers/answers.controller.js';
const router = new Router();

// Route to submit answers for a survey
router.post('/submitAnswer', submitAnswer);

router.post('/submitanswerfortargetted', submitanswerfortargetted)

// Route to get analysis for a specific question in a survey
router.get('/analysis/:surveyTitle/:surveyType/:surveyCategory',getSurveyAnalysis);

// // Route to get answers submitted by a specific user
// router.get('/userAnswers/:userId', verifyJWT, requireAdmin, getUserAnswers);

// Route to get analysis for a specific question in a survey
router.get('/getCustomAnalysis/:surveyTitle/:surveyType/:surveyCategory', getCustomAnalysis);

//Route to get respondent data
router.get('/getRespondentdata', getRespondentdata);

//Get Answer for 1 user
router.get('/getAnswersforUser', getAnswersforUser)

export default router;
