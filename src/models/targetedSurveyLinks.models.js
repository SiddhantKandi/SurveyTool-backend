//targeted survey link model
import mongoose from 'mongoose';

const targetedSurveyLinkSchema = new mongoose.Schema({
    surveyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isSubmitted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Add a compound unique index on surveyId and userId to prevent duplicates
targetedSurveyLinkSchema.index({ surveyId: 1, userId: 1 }, { unique: true });

export const targetedSurveyLink = mongoose.model("targetedSurveyLink", targetedSurveyLinkSchema);