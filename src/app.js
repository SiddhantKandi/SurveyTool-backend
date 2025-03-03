import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public")) //to store images , files if needed
app.use(cookieParser()) //to read cookies on browser


//import routes
import userRouter from './routes/user.routes.js'
import questionRouter from './routes/question.routes.js'
import surveyRouter from './routes/survey.routes.js'
import ansRouter from './routes/answer.routes.js'
import homeRouter from './routes/home.routes.js'
import targettedRouter from './routes/targettedsurvey.routes.js'
import { errorHandler } from './middlewares/errorhandler.middleware.js'

app.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: "The server is up and running"
    })
})

//user router
app.use('/api/v1/users', userRouter)

//question router
app.use('/api/v1/questions', questionRouter)

//Survey router
app.use('/api/v1/newSurvey', surveyRouter)

//Answer router
app.use('/api/v1/answers', ansRouter)

//Home router
app.use('/api/v1/home', homeRouter)

//Targeted survey router
app.use('/api/v1/targetted', targettedRouter)

//error handler
app.use(errorHandler)



export default app