const remainder = (username, survey_url) => {
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
                  height : auto;
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
                  background-color: #dc3545; /* Bootstrap danger red */
                  color: #ffffff; /* White text */
                  text-decoration: none;
                  border-radius: 6px;
                  font-size: 16px;
                  font-weight: bold;
                  transition: all 0.3s ease;
              }

              .button:hover {
                  background-color: #b02a37; /* Darker red */
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
                  <h1>Reminder: Complete Your Survey</h1>
              </div>
              <div class="content">
                  <p>Dear ${username},</p>
                  <p>We noticed that you haven't completed the survey yet. Your feedback is invaluable and helps us improve!</p>
                  <p>Please click the button below to complete the survey before the deadline.</p>
                  <div class="button-container">
                      <a href="${survey_url}" class="button">Complete the Survey</a>
                  </div>
                  <p>Thank you for your time and valuable input.</p>
                  <p>Best regards,<br><strong>Survey Sphere</strong></p>
              </div>
              
          </div>
      </body>
      
      </html>
    `;
};

export { remainder };
