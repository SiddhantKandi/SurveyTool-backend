import { Survey } from '../../models/survey.models.js';
import { Answer } from '../../models/answers.models.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';


const getHomedata = asyncHandler(async (req, res) => {
  try {
    // Fetch all surveys
    const surveys = (await Survey.find().select('surveyTitle surveyType createdAt surveyOpenClose surveyCategory'));
    const individualSurveys = surveys.filter(survey => survey.surveyCategory === 'individual');
    const industrySurveys = surveys.filter(survey => survey.surveyCategory === 'industry');

    if (!surveys) {
      throw new ApiError(400, {}, "No surveys found")
    }

    // Fetch the number of responses for each survey
    const industrysurveyData = await Promise.all(industrySurveys.map(async (survey) => {
      // Get distinct userIds for the current survey
      const distinctUsers = await Answer.distinct('userId', { surveyId: survey._id });

      const responseCount = distinctUsers.length;  // Count the distinct userIds

      // Format the createdAt date to "Date Month Year" (e.g., "15 October 2024")
      const formattedDate = new Date(survey.createdAt).toLocaleDateString('en-US', {
        day: 'numeric',
        year: 'numeric',
        month: 'long',
      });

      // Return the survey information
      return {
        surveyTitle: survey.surveyTitle,
        surveyType: survey.surveyType,
        responses: responseCount,
        DateCreated: formattedDate,
        surveyOpenClose: survey.surveyOpenClose,
        surveyCategory: survey.surveyCategory
      };
    }));

    const individualSurveyData = await Promise.all(individualSurveys.map(async (survey) => {
      // Get distinct userIds for the current survey
      const distinctUsers = await Answer.distinct('userId', { surveyId: survey._id });

      const responseCount = distinctUsers.length;  // Count the distinct userIds

      // Format the createdAt date to "Date Month Year" (e.g., "15 October 2024")
      const formattedDate = new Date(survey.createdAt).toLocaleDateString('en-US', {
        day: 'numeric',
        year: 'numeric',
        month: 'long',
      });

      // Return the survey information
      return {
        surveyTitle: survey.surveyTitle,
        surveyType: survey.surveyType,
        responses: responseCount,
        DateCreated: formattedDate,
        surveyOpenClose: survey.surveyOpenClose,
        surveyCategory: survey.surveyCategory
      };
    }));



    res.status(200).json(new ApiResponse(200, { industrysurveyData, individualSurveyData }, 'Data fetched successfully.'));
  } catch (error) {
    throw new ApiError(400, {}, 'Failed to fetch survey data.');
  }
});

export { getHomedata };
