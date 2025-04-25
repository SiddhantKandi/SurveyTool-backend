import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { User } from '../../models/users.models.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { targetedSurveyLink } from '../../models/targetedSurveyLinks.models.js'; // Assuming your targetedSurveyLink model
import { sendemail } from '../Targetted surveys/sendemail.controller.js'
import { Survey } from '../../models/survey.models.js'
import { sendemailremainder } from '../Targetted surveys/sendemailremainder.controller.js'

//Creating targetted users in the database
const targetteduser = asyncHandler(async (req, res) => {
  const users = req.body.users; // Access the users array properly

  if (!Array.isArray(users) || users.length === 0) {
    throw new ApiError(400,{}, "User is required to send survey");
  }

  // Filter out users with missing fields
  const invalidUsers = users.filter(
    ({ username, email }) => [username, email].some((field) => field?.trim() === "")
  );
  if (invalidUsers.length > 0) {
    throw new ApiError(400,{}, "All fields are required for each user");
  }

  // Find existing users by email or username
  const existingUsers = await User.find({
    $or: users.map(({ username, email }) => ({ $or: [{ username }, { email }] })),
    role: "targeted"
  });

  const existingEmails = new Set(existingUsers.map((user) => user.email));
  const existingUsernames = new Set(existingUsers.map((user) => user.username));

  // Filter out users that already exist based on email or username
  const newUsers = users.filter(
    ({ username, email }) => !existingEmails.has(email) && !existingUsernames.has(username)
  );

  // If no new users to create, return success
  if (newUsers.length === 0) {
    throw new ApiError(400, [], "No new users to register");
  }

  // Create all new users in one go
  const createdUsers = await User.insertMany(
    newUsers.map(({ username, email }) => ({
      username,
      email,
      role: "targeted"
    }))
  );

  const createdUserIds = createdUsers.map(user => user._id);

  return res.status(200).json(
    new ApiResponse(200, createdUserIds, "User registered successfully")
  );
});

//Sending email to respondents
const sendemailtorespondets = asyncHandler(async (req, res) => {
  const users = req.body.users;
  const { surveyTitle, surveyType,surveyCategory } = req.params;

  const survey = await Survey.findOne({ surveyTitle: surveyTitle, surveyType: surveyType, surveyCategory: surveyCategory })

  const surveyId = survey._id


  if (!Array.isArray(users) || users.length === 0) {
    throw new ApiError(400,{}, "User is required to send survey");
  }

  // Create a set to track all processed emails across batches
  const processedEmails = new Set();

  // Batch process users
  async function processUserBatch(userBatch) {
    // Create a set to track unique emails within the batch
    const batchEmailsSet = new Set();

    // Filter out users with duplicate emails within the batch
    const filteredBatch = userBatch.filter(({ email }) => {
      if (batchEmailsSet.has(email)) {
        return false; // Skip if email is already in the batch
      }
      batchEmailsSet.add(email);
      return true;
    });

    // Filter out users that have already been processed in previous batches
    const uniqueBatch = filteredBatch.filter(({ email }) => !processedEmails.has(email));

    // Find existing users in one query
    const emails = uniqueBatch.map(user => user.email);
    const existingUsers = await User.find({
      email: { $in: emails },
      role: 'targeted'
    });

    // Create map for quick lookup
    const existingUserMap = new Map(
      existingUsers.map(user => [user.email, user])
    );

    // Prepare new users to be created
    const newUsers = uniqueBatch
      .filter(({ email }) => !existingUserMap.has(email))
      .map(({ username, email }) => ({
        username,
        email,
        role: 'targeted'
      }));

    // Bulk insert new users if any
    let createdUsers = [];
    if (newUsers.length > 0) {
      createdUsers = await User.insertMany(newUsers);
      // Add newly created users to the map
      createdUsers.forEach(user => {
        existingUserMap.set(user.email, user);
      });
    }

    // Get all user IDs for survey link check
    const allUsers = [...existingUsers, ...createdUsers];
    const userIds = allUsers.map(user => user._id);

    // Find existing survey links in one query
    const existingLinks = await targetedSurveyLink.find({
      surveyId,
      userId: { $in: userIds }
    });

    const existingLinkMap = new Map(
      existingLinks.map(link => [link.userId.toString(), link])
    );

    // Prepare survey links and email tasks
    const linkCreationPromises = [];
    const emailTasks = [];

    for (const user of allUsers) {
      if (!existingLinkMap.has(user._id.toString())) {
        const uniqueSurveyLink = `${process.env.SURVEY_BASEURL}/${surveyTitle}/${surveyType}/${surveyCategory}?userId=${user._id}`;

        linkCreationPromises.push(
          targetedSurveyLink.create({
            surveyId,
            userId: user._id,
            isSubmitted: false
          })
        );

        emailTasks.push({
          email: user.email,
          username: user.username,
          surveyLink: uniqueSurveyLink
        });
      }

      // Add the user's email to the global processedEmails set
      processedEmails.add(user.email);
    }

    // Create all new survey links in parallel
    await Promise.all(linkCreationPromises);

    // Send emails in parallel with rate limiting
    const sendEmailWithRetry = async (task) => {
      try {
        await sendemail(task.email, task.username, task.surveyLink);
      } catch (error) {
        throw new ApiError(400,{}, `Failed to send email to ${task.email} after all retries:`);
      }
    };

    // Process emails in chunks to avoid overwhelming the email server
    const chunkSize = 10; // Adjust based on your email service limits
    for (let i = 0; i < emailTasks.length; i += chunkSize) {
      const chunk = emailTasks.slice(i, i + chunkSize);
      await Promise.all(chunk.map(task => sendEmailWithRetry(task)));
      if (i + chunkSize < emailTasks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between chunks
      }
    }

    return createdUsers.map(user => user._id);
  }

  // Process users in batches
  const batchSize = 100; // Adjust based on your needs

  for (let i = 0; i < users.length; i += batchSize) {
    const userBatch = users.slice(i, i + batchSize);
    const batchResults = await processUserBatch(userBatch);
  }

  return res.status(200).json(
    new ApiResponse(200,{},"Email sent successfully")
  );
});

//Sending reminder email to respondents
const sendremindertorespondents = asyncHandler(async (req, res) => {
  const { surveyTitle, surveyType,surveyCategory } = req.params;

  // Retrieve the survey based on the title and type
  const survey = await Survey.findOne({ surveyTitle, surveyType,surveyCategory });


  if (!survey) {
    return res.status(404).json({ message: "Survey not found" });
  }

  const surveyId = survey._id;

  // Find all users who haven't submitted the survey (isSubmitted: false)
  const pendingUsers = await targetedSurveyLink.find({
    surveyId: surveyId,
    isSubmitted: false,
  });

  if (pendingUsers.length === 0) {
    return res.status(200).json({ message: "No pending users to remind of filling the survey" });
  }

  // Extract user IDs from the pending survey links
  const userIds = pendingUsers.map((link) => link.userId);

  // Fetch user details for the pending users
  const users = await User.find({ _id: { $in: userIds } });

  if (users.length === 0) {
    return res.status(404).json({ message: "No users found for reminder" });
  }


  // Prepare and send reminder emails to each user
  const emailTasks = users.map(async (user) => {
    const uniqueSurveyLink = `${process.env.SURVEY_BASEURL}/${surveyTitle}/${surveyType}/${surveyCategory}?userId=${user._id}`;
    try {
      await sendemailremainder(user.email, user.username, uniqueSurveyLink);
    } catch (error) {
      throw new ApiError(400,{}, "Error while sending survey reminder email")  // Increment failure count on error
    }
  });

  // Wait for all email tasks to complete
  await Promise.all(emailTasks);

  return res.status(200).json({
    message: "Reminder emails process completed",
  });
});


export { targetteduser, sendemailtorespondets, sendremindertorespondents };