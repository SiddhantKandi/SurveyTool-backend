import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import { Question } from '../../models/questionsBank.models.js'

//Deleting the questions from the questionBank
const deleteQuestion = asyncHandler(async (req, res) => {

    const questionID = req.params?.id;

    if (!questionID) {
        throw new ApiError(400,{}, "Deleted question is not found in the database")
    }

    const deletedquestion = await Question.findByIdAndDelete(questionID)

    if (!deletedquestion) {
        throw new ApiError(400,{}, "Deleted question is not found in the database")
    }


    return res.status(200).json(
        new ApiResponse(200, deletedquestion,"Question is deleted from the database")
    )
})

export { deleteQuestion }