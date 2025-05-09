import { Router } from 'express'
import { addQuestions, getQuestions } from '../controllers/questionBank/questionBank.controller.js'
import { updateQuestion } from '../controllers/questionBank/updateQuestion.controller.js'
import { deleteQuestion } from '../controllers/questionBank/deleteQuestion.controller.js'
// import { verifyJWT } from '../middlewares/auth.middleware.js'
// import {requireAdmin} from '../middlewares/role.middleware.js'

const router = Router()

//Route to add a questions in the database
router.post('/add', addQuestions)

//Route to get questions from the database
router.get('/getquestions',getQuestions)

//Route to update questions from the database
router.put('/:id', updateQuestion)

//Route to delete questions from the database
router.delete('/:id', deleteQuestion)


export default router