import nodemailer from 'nodemailer';
import { remainder } from '../../mail/sendremainderTemplate.js'; // Import your survey email template
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

//controller to send reminder to the people who havent filled the survey
const sendemailremainder = async (userEmail, userName, survey_url) => {

  if(!userName){
    userName = "User"
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAILUSERNAME,
      pass: process.env.EMAILPASS
    },
  });

  // Use the sendSurveyEmail template
  let remainermail = remainder(userName, survey_url); // Pass the userName and survey URL to the email template

  let message = {
    from: process.env.EMAILUSERNAME,
    to: userEmail,
    subject: "Do not miss out to fill the survey",
    html: remainermail,  // Use the custom HTML template here
  };

  try {
    await transporter.sendMail(message);
    return new ApiResponse(200,{},`Survey send to ${userEmail} successfully`)
  } catch (error) {
    throw new ApiError(400,{},"Error sending reminder email");  // Propagate the error to the calling function
  }
};

export { sendemailremainder };
