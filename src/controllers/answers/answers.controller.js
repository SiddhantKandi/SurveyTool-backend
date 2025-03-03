import { Answer } from '../../models/answers.models.js';
import { Survey } from '../../models/survey.models.js'
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { User } from '../../models/users.models.js'
import { targetedSurveyLink } from '../../models/targetedSurveyLinks.models.js'
import { mongoose } from 'mongoose'

//function to submit answers for respondent and anonymous
const submitAnswer = asyncHandler(async (req, res) => {
  const { payload } = req.body;
  const { username, email, submissions, userLocation } = payload; // Array of submissions

  let user = null;

  //checking if user already exits
  if (username || email) {
    user = await User.findOne({
      $or: [{ username }, { email }],
    });
  }

  let userId = null;

  if (user) {
    userId = user._id;
  }

  let surveyId = submissions[0]?.surveyId;

  const response = await Answer.findOne({ userId, surveyId });

  if (response) {
    throw new ApiError(400, {}, "You have already filled out the survey.");
  }


  //Finding the survey by surveyId in database
  for (const { surveyId } of submissions) {
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      throw new ApiError(400, {}, `Survey with ID ${surveyId} not found`);
    }

    //If survey is closed it will not accept any responses
    if (survey.surveyOpenClose === 'closed') {
      return res.status(400).json(new ApiResponse(200, {}, "Survey is Closed"));
    }

    //If user does not exists, create a anonymous one
    if (!user) {
      if (survey.surveyType === 'anonymous') {
        user = await User.create({
          username: `anonymous_${Date.now()}`,
          email: `anonymous_${Date.now()}@example.com`,
          role: 'anonymous_user',
          respondentAddress: userLocation.address
        });
      }
      //For respondent users checking for user details and if all fields exists it creates new users
      else {
        if (!username || !email) {
          throw new ApiError(400, {}, 'Username and email are required!');
        }

        user = await User.create({
          username,
          email,
          role: 'respondent',
          respondentAddress: userLocation.address
        });
      }
    }
  }


  //Creating a new object for answers collection
  for (const { surveyId, questionId, answer } of submissions) {
    const newAnswer = new Answer({
      answer: Array.isArray(answer) ? answer : [answer],
      surveyId,
      questionId,
      userId: user ? user._id : null,
    });

    const savedAnswer = await newAnswer.save();
  }

  return res.status(201).json(
    new ApiResponse(201, {}, 'Survey answers submitted and user registered successfully')
  );
});

//Function to get the analysis of the survey
const getSurveyAnalysis = asyncHandler(async (req, res) => {
  const { surveyType, surveyTitle, surveyCategory } = req.params;

  const { startDate, endDate } = req.query;

  // Validate if the survey exists
  const survey = await Survey.findOne({ surveyTitle, surveyType, surveyCategory });
  if (!survey) {
    throw new ApiError(400, {}, 'Survey not found');
  }

  const surveyId = survey._id;

  // Convert a date string to a Date object in IST
  const convertToIST = (date) => {
    const dateObj = new Date(date);
    return new Date(dateObj.getTime() + 5.5 * 60 * 60 * 1000); // Add 5 hours and 30 minutes
  };

  // Building the match condition for the date range
  let dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else if (startDate) {
    dateFilter.createdAt = { $gte: new Date(startDate) };
  } else if (endDate) {
    dateFilter.createdAt = { $lte: new Date(endDate) };
  }

  // Get the survey details and apply the date filter if provided
  const analysis = await Answer.aggregate([
    {
      $lookup: {
        from: "surveys",
        localField: "surveyId",
        foreignField: "_id",
        as: "surveyDetails"
      }
    },
    { $unwind: "$surveyDetails" },
    {
      $match: {
        "surveyDetails.surveyTitle": surveyTitle,
        "surveyDetails.surveyType": surveyType,
        "surveyDetails.surveyCategory": surveyCategory,
        ...dateFilter
      }
    },
    {
      $lookup: {
        from: "surveyquestions",
        localField: "questionId",
        foreignField: "_id",
        as: "questionDetails"
      }
    },
    { $unwind: "$questionDetails" },
    { $unwind: "$answer" },
    {
      $group: {
        _id: {
          questionId: "$questionId",
          answer: "$answer"
        },
        count: { $sum: 1 },
        question: { $first: "$questionDetails.question" },
        options: { $first: "$questionDetails.options" },
        questiontype: { $first: "$questionDetails.questiontype" },
        createdAt: { $first: "$createdAt" }
      }
    },
    {
      $group: {
        _id: "$_id.questionId",
        question: { $first: "$question" },
        options: { $first: "$options" },
        questiontype: { $first: "$questiontype" },
        answerCounts: {
          $push: {
            k: "$_id.answer",
            v: "$count"
          }
        },
        createdAt: { $first: "$createdAt" }
      }
    },
    {
      $project: {
        _id: 1,
        question: 1,
        options: 1,
        questiontype: 1,
        answerCounts: { $arrayToObject: "$answerCounts" },
        createdAt: 1
      }
    }
  ]);

  // Get total respondents (people who were targeted)
  const totalRespondents = await targetedSurveyLink.countDocuments({
    surveyId: surveyId,
    ...dateFilter
  });

  // Get total responses (people who actually submitted)
  const totalResponses = await targetedSurveyLink.countDocuments({
    surveyId: surveyId,
    isSubmitted: true,
    ...dateFilter
  });

  // Calculate response rate percentage
  const responseRate = totalRespondents === 0 ?
    0 :
    ((totalResponses / totalRespondents) * 100).toFixed(2);

  // Convert the 'createdAt' field to IST for each result and add metrics
  const analysisWithIST = analysis?.map(item => ({
    ...item,
    createdAt: convertToIST(item.createdAt).toLocaleDateString(),
  }));

  // Create the final response object with separate metrics
  const responseData = {
    analysis: analysisWithIST,
    metrics: {
      totalRespondents,
      totalResponses,
      responseRate: parseFloat(responseRate)
    }
  };

  res.status(200).json(
    new ApiResponse(
      200,
      responseData,
      'Survey analysis loaded successfully'
    )
  );
});


const getCustomAnalysis = asyncHandler(async (req, res) => {
  const { surveyType, surveyTitle, surveyCategory } = req.params;
  const { startDate, endDate } = req.query;

  let responses = req.query;

  // Now responses is an object, and you can continue with your logic
  const answerMatchConditions = Object.values(responses).flat();


  // Check if survey exists
  const survey = await Survey.findOne({ surveyTitle, surveyType, surveyCategory });
  if (!survey) {
    throw new ApiError(400, {}, 'Survey not found');
  }

  // Convert a date string to a Date object in IST
  const convertToIST = (date) => {
    const dateObj = new Date(date);
    return new Date(dateObj.getTime() + 5.5 * 60 * 60 * 1000); // Add 5 hours and 30 minutes
  };

  const surveyId = survey._id;

  // Date range filter
  let dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  // Aggregation pipeline
  const customAnalysis = await Answer.aggregate([
    {
      $group: {
        _id: "$userId",
        answers: { $push: "$answer" },
        surveyId: { $first: "$surveyId" },
        userId: { $first: "$userId" },
        answerIds: { $push: "$_id" },
      },
    },
    {
      $project: {
        answers: {
          $reduce: {
            input: "$answers",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
        surveyId: 1,
        answerIds: 1,
      },
    },
    {
      $match: {
        answers: { $all: answerMatchConditions }, // Matches answers only
        surveyId: surveyId,
      },
    },
    {
      $group: {
        _id: null,
        answerIds: { $push: "$answerIds" },
      },
    },
    {
      $project: {
        answerIds: {
          $reduce: {
            input: "$answerIds",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
        _id: 0,
      },
    },
    {
      $unwind: "$answerIds",
    },
    {
      $lookup: {
        from: "answers",
        localField: "answerIds",
        foreignField: "_id",
        as: "answer",
      },
    },
    {
      $unwind: "$answer",
    },
    {
      $replaceRoot: { newRoot: "$answer" },
    },

    //*************************************************************************************** */

    {
      $lookup: {
        from: "surveys",
        localField: "surveyId",
        foreignField: "_id",
        as: "surveyDetails",
      },
    },
    { $unwind: "$surveyDetails" },
    {
      $lookup: {
        from: "surveyquestions",
        localField: "questionId",
        foreignField: "_id",
        as: "questionDetails",
      },
    },
    { $unwind: "$questionDetails" },
    { $unwind: "$answer" },
    {
      $group: {
        _id: {
          questionId: "$questionId",
          answer: "$answer",
        },
        count: { $sum: 1 },
        question: { $first: "$questionDetails.question" },
        options: { $first: "$questionDetails.options" },
        questiontype: { $first: "$questionDetails.questiontype" },
        createdAt: { $first: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$_id.questionId",
        question: { $first: "$question" },
        options: { $first: "$options" },
        questiontype: { $first: "$questiontype" },
        answerCounts: {
          $push: {
            k: "$_id.answer",
            v: "$count",
          },
        },
        createdAt: { $first: "$createdAt" },
      },
    },
    {
      $project: {
        _id: 0,
        question: 1,
        options: 1,
        questiontype: 1,
        answerCounts: { $arrayToObject: "$answerCounts" },
        createdAt: 1,
      },
    },
  ]);

  //Aggregation Pipeline where the question selected with matching options does not display 
  // const customAnalysis = await Answer.aggregate([
  //   {
  //     $group: {
  //       _id: "$userId",
  //       answers: { $push: "$answer" },
  //       surveyId: { $first: "$surveyId" },
  //       userId: { $first: "$userId" },
  //       answerIds: { $push: "$_id" },
  //     },
  //   },
  //   {
  //     $project: {
  //       answers: {
  //         $reduce: {
  //           input: "$answers",
  //           initialValue: [],
  //           in: { $concatArrays: ["$$value", "$$this"] },
  //         },
  //       },
  //       surveyId: 1,
  //       answerIds: 1,
  //     },
  //   },
  //   {
  //     $match: {
  //       answers: { $all: answerMatchConditions }, // Matches answers only
  //       surveyId: surveyId,
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: null,
  //       answerIds: { $push: "$answerIds" },
  //     },
  //   },
  //   {
  //     $project: {
  //       answerIds: {
  //         $reduce: {
  //           input: "$answerIds",
  //           initialValue: [],
  //           in: { $concatArrays: ["$$value", "$$this"] },
  //         },
  //       },
  //       _id: 0,
  //     },
  //   },
  //   {
  //     $unwind: "$answerIds",
  //   },
  //   {
  //     $lookup: {
  //       from: "answers",
  //       localField: "answerIds",
  //       foreignField: "_id",
  //       as: "answer",
  //     },
  //   },
  //   {
  //     $unwind: "$answer",
  //   },
  //   {
  //     $replaceRoot: { newRoot: "$answer" },
  //   },

  //   //*************************************************************************************** */

  //   {
  //     $lookup: {
  //       from: "surveys",
  //       localField: "surveyId",
  //       foreignField: "_id",
  //       as: "surveyDetails",
  //     },
  //   },
  //   { $unwind: "$surveyDetails" },
  //   {
  //     $lookup: {
  //       from: "surveyquestions",
  //       localField: "questionId",
  //       foreignField: "_id",
  //       as: "questionDetails",
  //     },
  //   },
  //   { $unwind: "$questionDetails" },
  //   { $unwind: "$answer" },
  //   {
  //     $group: {
  //       _id: {
  //         questionId: "$questionId",
  //         answer: "$answer",
  //       },
  //       count: { $sum: 1 },
  //       question: { $first: "$questionDetails.question" },
  //       options: { $first: "$questionDetails.options" },
  //       questiontype: { $first: "$questionDetails.questiontype" },
  //       createdAt: { $first: "$createdAt" },
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: "$_id.questionId",
  //       question: { $first: "$question" },
  //       options: { $first: "$options" },
  //       questiontype: { $first: "$questiontype" },
  //       answerCounts: {
  //         $push: {
  //           k: "$_id.answer",
  //           v: "$count",
  //         },
  //       },
  //       createdAt: { $first: "$createdAt" },
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       question: 1,
  //       options: 1,
  //       questiontype: 1,
  //       answerCounts: { $arrayToObject: "$answerCounts" },
  //       createdAt: 1,
  //     },
  //   },
  //   {
  //     $match: {
  //       $expr: {
  //         $not: {
  //           $anyElementTrue: {
  //             $map: {
  //               input: "$options",
  //               as: "option",
  //               in: { $in: ["$$option", answerMatchConditions] },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // ]);

  // Convert 'createdAt' to IST


  const analysisWithIST = customAnalysis?.map(item => ({
    ...item,
    createdAt: convertToIST(item.createdAt).toLocaleDateString()
  }));

  res.status(200).json(new ApiResponse(200, analysisWithIST, 'Custom survey analysis done'));
});


//Submitting the answers for targetted users
const submitanswerfortargetted = asyncHandler(async (req, res) => {
  const { payload } = req.body;
  const { userId, submissions, userLocation } = payload;
  const { address } = userLocation;

  try {
    // Update the targeted survey record to indicate submission

    let surveyId = submissions[0]?.surveyId;

    const response = await Answer.findOne({ userId, surveyId });

    if (response) {
      throw new ApiError(400, {}, "You have already filled out the survey.");
    }


    await targetedSurveyLink.findOneAndUpdate(
      { userId },
      { isSubmitted: true }
    );

    // Update the user's address
    await User.findByIdAndUpdate(
      userId,
      { respondentAddress: address },
    );



    //Adding the responses for the targetted users in the database
    for (const { surveyId, questionId, answer } of submissions) {
      const newAnswer = new Answer({
        answer: Array.isArray(answer) ? answer : [answer],
        surveyId,
        questionId,
        userId,
      });

      const savedAnswer = await newAnswer.save();
    }



    return res.status(200).json(new ApiResponse(200, {}, "Survey submitted successfully"));
  } catch (error) {
    throw new ApiError(400, {}, "Failed to submit the survey");
  }
});

//Get respondent data
const getRespondentdata = asyncHandler(async (req, res) => {
  const { surveyTitle, surveyType, surveyCategory } = req.query


  // Validate if the survey exists
  const survey = await Survey.findOne({ surveyTitle, surveyType, surveyCategory });
  if (!survey) {
    throw new ApiError(400, {}, 'Survey not found');
  }

  const distinctUsersIds = await Answer.distinct('userId', { surveyId: survey._id });

  const answeredRespondents = await User.find({ _id: { $in: distinctUsersIds } });

  if (surveyType !== 'targeted') {
    return res.status(200).json(new ApiResponse(200, answeredRespondents, "Survey Respondents fetched successfully"));
  }

  const notAnsweredUserIds = await targetedSurveyLink.distinct('userId', {
    surveyId: survey._id,
    userId: { $nin: distinctUsersIds },
  });

  const notAnsweredRespondents = await User.find({ _id: { $in: notAnsweredUserIds } });

  return res.status(200).json(new ApiResponse(200, { answeredRespondents, notAnsweredRespondents }, "Survey Respondents fetched successfully"));

})

const getAnswersforUser = asyncHandler(async (req, res) => {
  const { userId, surveyTitle, surveyType, surveyCategory } = req.query;

  // Validate if the survey exists
  const survey = await Survey.findOne({ surveyTitle, surveyType, surveyCategory });
  if (!survey) {
    throw new ApiError(400, {}, 'Survey not found');
  }

  const surveyId = survey._id;

  // Aggregation pipeline to fetch answers and corresponding questions
  const answers = await Answer.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId), // Convert userId to ObjectId if it's stored as ObjectId in MongoDB
        surveyId: new mongoose.Types.ObjectId(surveyId) // Convert surveyId to ObjectId
      }
    },
    {
      $lookup: {
        from: 'surveyquestions', // Assuming the collection name for questions is 'questions'
        localField: 'questionId',
        foreignField: '_id',
        as: 'questionDetails'
      }
    },
    {
      $unwind: '$questionDetails' // Flatten the question details array
    },
    {
      $project: {
        _id: 0, // Exclude the _id from the result
        question: '$questionDetails.question', // Assuming 'text' holds the question text
        options: '$questionDetails.options', // Assuming 'options' holds the options
        answer: '$answer' // Retain the answer as an array
      }
    }
  ]);

  if (!answers || answers.length === 0) {
    return res.status(404).json(new ApiError(400, {}, 'Answers for the user not found'));
  }
  return res.status(200).json(new ApiResponse(200, answers, "Answers fetched successfully!"));
});



export { submitAnswer, getSurveyAnalysis, submitanswerfortargetted, getCustomAnalysis, getRespondentdata, getAnswersforUser };
