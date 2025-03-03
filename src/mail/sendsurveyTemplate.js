
//sending the email to the targeted users
const sendSurveyEmail = (username, survey_url) => {
    return `
        <!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Survey Reminder</title>
          <style>
              /* General Styles */
              body {
                  font-family: 'Arial', sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }

              .container {
                  width: 650px;
                  margin: 40px auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                  overflow: hidden;
                  font-size: 16px;
                  line-height: 1.6;
              }

              /* Header Styles */
              .header {
                  background-color: #004085; /* Navy blue background */
                  color: #ffffff;
                  padding: 30px;
                  text-align: center;
              }

              .header img {
                  max-width: 250px;
                  margin-bottom: 15px;
              }

              .header h1 {
                  font-size: 26px;
                  margin: 0;
                  font-weight: bold;
              }

              /* Content Section */
              .content {
                  padding: 30px;
                  color: #495057;
                  background-color: #ffffff;
              }

              .content p {
                  margin: 15px 0;
                  font-size: 16px;
                  color: #333;
              }

              /* Button Styles */
              .button-container {
                  text-align: center;
                  margin: 20px 0;
              }

                .button {
                 display: inline-block;
                 padding: 12px 25px;
                 background-color: #28a745; /* Bootstrap success green */
                 color: #ffffff; /* White text */
                 text-decoration: none;
                 border-radius: 6px;
                 font-size: 16px;
                 font-weight: bold;
                 transition: all 0.3s ease;
               }

               .button:hover {
               background-color: #218838; /* Darker green */
               }

              /* Footer Section */
              .footer {
                  background-color: #f8f9fa;
                  padding: 20px;
                  text-align: center;
                  font-size: 14px;
                  color: #6c757d;
                  border-top: 1px solid #e9ecef;
              }

              .footer a {
                  color: #004085;
                  text-decoration: none;
              }

              .footer a:hover {
                  text-decoration: underline;
              }

              .social-icons {
                  margin-top: 10px;
              }

              .social-icons img {
                  width: 24px;
                  margin: 0 5px;
                  opacity: 0.8;
                  transition: opacity 0.3s ease;
              }

              .social-icons img:hover {
                  opacity: 1;
              }
          </style>
      </head>
      
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://peopleprudent.com/wp-content/uploads/2021/12/logo-1.png" alt="Logo">
                  <h1>You're Invited to Participate in a Survey</h1>
              </div>
              <div class="content">
                  <p>Dear ${username},</p>
                  <p>We value your feedback and would like to invite you to participate in a survey. Your responses will help us improve and better serve you in the future.</p>
                   <p>To begin the survey, please click the button below:</p>
                  <div class="button-container">
                      <a href="${survey_url}" class="button">Fill out the Survey</a>
                  </div>
                  <p>Thank you for your time and valuable input.</p>
                  <p>Best regards,<br><strong>People Prudent Consulting and HR Solutions</strong></p>
              </div>
              <div class="footer">
                  <p>&copy; 2024 People Prudent Consulting and HR Solutions. All rights reserved.</p>
                  <p><a href="https://peopleprudent.com/">Visit our website</a></p>
              </div>
          </div>
      </body>
      
      </html>
    `;
};

export { sendSurveyEmail };
