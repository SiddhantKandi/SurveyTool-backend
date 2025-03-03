import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { Question } from '../../models/questionsBank.models.js'


//Update the question properties by questionbyID
const updateQuestion = asyncHandler(async (req, res) => {

    const questionID = req.params.id;

    if(!questionID){
        throw new ApiError(400,{},"The question cannot be updated as it is not present in database")
    }

    const { question, options, questioncategory, questiontype } = req.body


    // Check if mandatory fields are missing or invalid
    if (
        !question?.trim() ||
        !questioncategory?.trim() ||
        !questiontype?.trim() ||
        (questiontype !== 'Descriptive' && (!Array.isArray(options) || options.length === 0))
    ) {
        throw new ApiError(400,{}, "Invalid or Missing fields")
    }


    const updatedQuestion = await Question.findByIdAndUpdate(
        questionID,
        {
            question,
            questiontype,
            questioncategory,
            options
        },
        { new: true, runValidators: true }
    )

    if (!updatedQuestion) {
        throw new ApiError(400,{}, "No question found in the database")
    }

    //Return the updated question
    return res.status(200).json(
        new ApiResponse(200, updatedQuestion,"Question updated successfully")
    )

})


export { updateQuestion }