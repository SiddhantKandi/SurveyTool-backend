import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { Surveyquestion } from '../../models/surveyQuestion.models.js'

//Updating a particular question in the survey
const updateQuestion = asyncHandler(async (req, res) => {

    // Destructure the 'updateQuestion' object from the request body
    const { updateQuestion } = req.body;

    // Then, destructure 'question', 'options', and 'questiontype' from 'updatedQuestion'
    const { question, options, questiontype, _id } = updateQuestion;

    // Check if mandatory fields are missing or invalid
    if (
        !question?.trim() ||
        !questiontype?.trim() ||
        !_id?.trim() ||
        (!Array.isArray(options) || options.length === 0)
    ) {
        throw new ApiError(400,{}, "Invalid or Missing fields");
    }

    const updatedQuestion = await Surveyquestion.findByIdAndUpdate(
        _id,
        {
            question,
            questiontype,
            options,
        },
        { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
        throw new ApiError(405,{}, "No question found in the survey");
    }

    // Return the updated question
    return res.status(200).json(
        new ApiResponse(200, updatedQuestion,"Question updated successfully")
    );
});



export { updateQuestion }