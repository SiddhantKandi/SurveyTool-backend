//quesion model
import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
    question : {
        type : String,
        required : true,
        unique : true
    },
    questiontype : {
        type : String,
        required : true,
    },
    questioncategory : {
        type : String,
        required : true,
    },
    options : [
        {type : String},
    ]

},{timestamps: true})

export const Question  = mongoose.model("Question",questionSchema);