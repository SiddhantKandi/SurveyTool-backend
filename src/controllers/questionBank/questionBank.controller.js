

import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { Question } from '../../models/questionsBank.models.js';

//Adding questions to the database send by the users from frontend
const addQuestions = asyncHandler(async (req, res) => {
  const { questionsList } = req.body; // Destructure questionsList from the request body


  // Check if the questionsList is provided and is an array
  if (!Array.isArray(questionsList) || questionsList.length === 0) {
    throw new ApiError(400,{}, 'No questions provided');
  }

  const skippedQuestions = [];
  const normalizedValidQuestions = [];

  // Filter and normalize each question in questionsList
  questionsList.forEach((questionData) => {

    const { question, questioncategory, questiontype, options } = questionData;

    // Normalize and trim fields
    const normalizedQuestion = question?.trim().toLowerCase();
    const normalizedCategory = questioncategory?.trim().toLowerCase();
    const normalizedType = questiontype?.trim().toLowerCase();
    const normalizedOptions = Array.isArray(options)
      ? options.map((option) => option.trim().toLowerCase())
      : [];

    // Check for missing or invalid fields
    if (!normalizedQuestion || !normalizedCategory || !normalizedType || normalizedOptions.length === 0) {
      skippedQuestions.push({ question, reason: 'Invalid or missing fields' });
    } else {
      // Add the normalized question data to valid questions array
      normalizedValidQuestions.push({
        question: normalizedQuestion,
        questioncategory: normalizedCategory,
        questiontype: normalizedType,
        options: normalizedOptions,
      });
    }
  });

  // If no valid questions are available, throw an error
  if (normalizedValidQuestions.length === 0) {
    throw new ApiError(400, 'No valid questions provided');
  }

  // Check for existing questions to avoid duplicates
  const existingQuestions = await Question.find({
    question: { $in: normalizedValidQuestions.map((q) => q.question) },
  }).select('question');

  const existingQuestionSet = new Set(existingQuestions.map((q) => q.question));



  // Filter out already existing questions
  const newQuestions = normalizedValidQuestions.filter(
    (questionData) => !existingQuestionSet.has(questionData.question)
  );


  // Collect skipped questions due to duplicates
  skippedQuestions.push(
    ...normalizedValidQuestions
      .filter((questionData) => existingQuestionSet.has(questionData.question))
      .map((questionData) => ({
        question: questionData.question,
        reason: 'Question already exists in the database',
      }))
  );

  // If no new questions, return early with an error
  if (newQuestions.length === 0) {
    throw new ApiError(400, 'No new questions were added');
  }

  // Insert new questions into the database in bulk
  const createdQuestions = await Question.insertMany(newQuestions);

  // Respond with the added questions and any skipped questions
  return res.status(201).json(
    new ApiResponse(201, {
      addedQuestions: createdQuestions,
      skippedQuestions,
    }, `${createdQuestions.length} questions successfully added`,)
  );
});



//Getting the questions from the backend to display in the frontend
const getQuestions = asyncHandler(async (req, res) => {
  const questions = await Question.find(); // Fetch all questions

  return res.status(200).json(
    new ApiResponse(200, questions,'Questions retrieved successfully')
  );
});

export { addQuestions, getQuestions };
