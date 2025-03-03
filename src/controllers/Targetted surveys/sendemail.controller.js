import nodemailer from 'nodemailer';
import { sendSurveyEmail } from '../../mail/sendsurveyTemplate.js'; // Import your survey email template
import {ApiError} from '../../utils/ApiError.js'

//controller to send email to users
const sendemail = async (userEmail, userName, survey_url) => {

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
  let mail = sendSurveyEmail(userName, survey_url); // Pass the userName and survey URL to the email template

  let message = {
    from: process.env.EMAILUSERNAME,
    to: userEmail,
    subject: "You're Invited: Participate in our Survey",
    html: mail,  // Use the custom HTML template here
  };

  //sending email
  try {
    await transporter.sendMail(message);
    return { success: true, msg: "Survey invitation email sent successfully!" };
  } catch (error) {
    throw new ApiError(400,{},"Error sending survey email");
  }
};

export { sendemail };
