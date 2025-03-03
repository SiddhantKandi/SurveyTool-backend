import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { Surveyquestion } from '../../models/surveyQuestion.models.js'

//deleting a particular question from the survey
const deleteSurveyQuestion = asyncHandler(async (req, res) => {

    const questionID = req.params.id;

    if (!questionID) {
        throw new ApiError(400,{}, "Deleted question is not found in the survey")
    }

    const deletedquestion = await Surveyquestion.findByIdAndDelete(questionID)

    if (!deletedquestion) {
        throw new ApiError(400,{}, "Deleted question is not found in the survey")
    }


    res.status(200).json(
        new ApiResponse(200,{},"Question is deleted from the survey")
    )
})

export { deleteSurveyQuestion }