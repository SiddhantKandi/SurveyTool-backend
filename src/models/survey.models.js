//survey model(common fields)
import mongoose from 'mongoose';

const linkcollectorSchema = new mongoose.Schema({
    surveyTitle: {
        type: String,
        required: true,
    },
    surveyCategory: {
        type: String,
        required: true,
        enum: ['industry','individual'],
        default : 'individual'
    },
    link: {
        type: String,
        required: true
    },
    surveyType: {
        type: String,
        required: true
    },
    surveyOpenClose: {
        type: String,
        enum: ['open', 'closed'], // Enforce 'open' or 'closed' values
        default: 'open',
    },
    isTemplatePresent : {
        type: Boolean,
        default: false
    },
    template: {
        type: Array,
    }
}, { timestamps: true });

export const Survey = mongoose.model("Survey", linkcollectorSchema);
