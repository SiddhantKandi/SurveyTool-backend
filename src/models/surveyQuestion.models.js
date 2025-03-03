//Question schema for each survey question
import mongoose from 'mongoose'

const surveyquestionSchema = new mongoose.Schema({
    surveyId : {
        type: mongoose.Schema.Types.ObjectId,
        required : "Survey"
    },
    question: {
        type: String,
        required: true
    },
    options: [
        {
            type: String,
            required: true
        }
    ],
    questioncategory : {
        type : String,
        required : true
    },
    questiontype : {
        type : String,
        required : true
    }

}, { timestamps: true })

export const Surveyquestion = mongoose.model("Surveyquestion", surveyquestionSchema)