//answers model
import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
    answer: {
        type: Array,
        required: true
    },
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Survey",   // Reference to the Survey that the answer belongs to
        required: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Surveyquestion",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",     // Reference to the User who submitted the answer
    }
}, { timestamps: true });

export const Answer = mongoose.model("Answer", answerSchema);
