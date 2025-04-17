import { Surveyquestion } from '../../models/surveyQuestion.models.js'
import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { Survey } from '../../models/survey.models.js'
import { Answer } from '../../models/answers.models.js'
import { targetedSurveyLink } from '../../models/targetedSurveyLinks.models.js'
import { User } from '../../models/users.models.js'

//Taking the survey questions, surveyType, surveyTitle and creating a new survey
const newsurvey = asyncHandler(async (req, res, next) => {

    const { surveyData } = req.body;

    const { surveyTitle, surveyType, surveyCategory,Surveyquestions } = surveyData;

    const template = Surveyquestions;

    //Validate the data coming from the frontend
    if (!surveyTitle || !surveyType || !surveyCategory) {
        throw new ApiError(400, {}, "Survey details are required");
    }
    

    let isTemplatePresent = false;

    if(template.length > 0){
        isTemplatePresent = true;
    }

    const commonsurveyfields = await Survey.findOne({
        surveyTitle: surveyTitle,
        surveyType: surveyType,
        surveyCategory: surveyCategory,
        link: `${process.env.SURVEY_BASEURL}/${surveyTitle}/${surveyType}/${surveyCategory}`,
        isTemplatePresent : isTemplatePresent,
        template : template
    })

    if (commonsurveyfields) {
        // return res.status(400).json({ message: "Survey already exists" });
        return next();
    }

    const newsurveyfields = await Survey({
        surveyTitle: surveyTitle,
        surveyType: surveyType,
        surveyCategory: surveyCategory,
        link: `${process.env.SURVEY_BASEURL}/${surveyTitle}/${surveyType}/${surveyCategory}`,
        isTemplatePresent : isTemplatePresent,
        template : template
    })


    try {
        await newsurveyfields.save();
    } catch (error) {
        throw new ApiError(400, {}, "Failed to save survey fields. Please try again.");
    }

    next();

});


const newSurveyquestion = asyncHandler(async (req, res) => {
    // Take the data from the frontend
    const { surveyData } = req.body;

    const { Surveyquestions, surveyTitle, surveyType, surveyCategory } = surveyData;


    // Validate the data coming from the frontend
    if (!surveyTitle || !surveyType || !surveyCategory || !Array.isArray(Surveyquestions) || Surveyquestions.length === 0) {
        throw new ApiError(400, {}, "SurveyTitle, SurveyType,SurveyCategory, questions, and options are required");
    }

    // Check if the survey exists
    const existingSurvey = await Survey.findOne({ surveyTitle, surveyType, surveyCategory });

    // If survey does not exist
    if (!existingSurvey) {
        throw new ApiError(404, {}, "Survey not found");
    }

    const surveyId = existingSurvey._id; // Get the survey ID

    // Filter out questions that already exist in the database
    const existingQuestions = await Surveyquestion.find({
        surveyId,
        $or: Surveyquestions.map(q => ({
            question: q.question,
            options: q.options,
            questiontype: q.questiontype,
            questioncategory: q.questioncategory,
        })),
    });

    const existingQuestionSet = new Set(existingQuestions.map(q => q.question)); // Set for quick lookup

    // Filter only new questions to be added
    const newQuestions = Surveyquestions.filter(
        q => !existingQuestionSet.has(q.question)
    ).map(q => ({
        surveyId,
        question: q.question,
        options: q.options,
        questiontype: q.questiontype,
        questioncategory: q.questioncategory,
    }));

    if (newQuestions.length === 0) {
        return res.status(200).json(new ApiResponse(200, {}, "No new questions were added."));
    }


    // Insert all new questions at once
    try {
        const savedQuestions = await Surveyquestion.insertMany(newQuestions);

        res.status(200).json({
            message: "Survey saved successfully",
            savedQuestionArray: savedQuestions, // Return saved questions to the frontend
        });
    } catch (error) {

        throw new ApiError(500, {}, "Failed to save questions. Please try again.");
    }
});


//Getting survey by surveyId , the admin is sending the surveyTitle and surveyType from the frontend
const getSurveyById = asyncHandler(async (req, res) => {
    const { surveyTitle, surveyType, surveyCategory } = req.query;

    const survey = await Survey.findOne({ surveyTitle: surveyTitle, surveyType: surveyType, surveyCategory: surveyCategory });

    
    if (!survey) {
        throw new ApiError(404, {}, "No survey found ");
    }

    const surveyId = survey._id;

    if (!surveyId) {
        throw new ApiError(404, {}, "No questions found with this surveyId ");
    }

    const surveyOpenClose = survey.surveyOpenClose;
    const surveyQuestions = await Surveyquestion.find({ surveyId: surveyId })
    const template = survey.template;
    const surveyLink = survey.link;


    if (!surveyQuestions || surveyQuestions.length === 0) {
        throw new ApiError(404, {}, "No survey found with this Id");
    }

    res.status(200).json({ surveyQuestions, surveyOpenClose, surveyLink,template });
});

//Check if survey is open or close
const setSurveyOpenClose = asyncHandler(async (req, res) => {
    const { surveyTitle, surveyType, surveyCategory } = req.body;

    // Validate the data coming from the frontend
    if (!surveyTitle || !surveyType || !surveyCategory) {
        throw new ApiError(400, {}, "SurveyTitle, SurveyType and SurveyCategory are required");
    }

    // Check if the survey exists
    const existingSurvey = await Survey.findOne({ surveyTitle, surveyType, surveyCategory });

    if (!existingSurvey) {
        throw new ApiError(404, {}, "Survey not found");
    }

    // Toggle the surveyOpenClose field
    existingSurvey.surveyOpenClose = existingSurvey.surveyOpenClose === 'open' ? 'closed' : 'open';

    // Save the updated survey
    await existingSurvey.save();

    // Respond with the updated survey data
    res.status(200).json({ message: 'Survey status updated successfully', survey: existingSurvey });
});

//Function to deletetheSurvey
const deleteSurvey = asyncHandler(async (req, res) => {

    const { surveyTitle, surveyType, surveyCategory } = req.body;


    // Delete the survey document based on title and type
    const survey = await Survey.findOneAndDelete({ surveyTitle: surveyTitle, surveyType: surveyType, surveyCategory: surveyCategory });

    if (!survey) {
        throw new ApiError(404, {}, "No survey found");
    }

    const surveyId = survey._id;

    // Delete all questions related to this survey
    await Surveyquestion.deleteMany({ surveyId: surveyId });

    // Retrieve answers associated with this survey
    const answers = await Answer.find({ surveyId: surveyId });

    // If no answers are found, delete TargetedSurveyLink if survey is targeted
    if (answers.length === 0) {
        if (surveyType === 'targeted') {
            await targetedSurveyLink.deleteMany({ surveyId: surveyId });
        }
        return res.status(200).json(new ApiResponse(200, {}, "Survey deleted!"));
    }

    // Delete all answers related to this survey
    await Answer.deleteMany({ surveyId: surveyId });

    const answeredUserIds = await Answer.distinct("userId");


    const users = await User.deleteMany(
        {
            _id: { $nin: answeredUserIds },
            role: { $ne: "admin" }
        }
    );



    if (surveyType === 'targeted') {
        await targetedSurveyLink.deleteMany({ surveyId: surveyId });
    }


    return res.status(200).json(new ApiResponse(200, {}, "Survey and related data deleted successfully"));
});


export { newSurveyquestion, getSurveyById, newsurvey, setSurveyOpenClose, deleteSurvey }