const otpTemplate = (username, otp) => {
	return `<!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Account</title>
          <style>
              /* General Styles */
              body {
                  font-family: 'Arial', sans-serif;
                  background-color: #f3f4f6;
                  margin: 0;
                  padding: 0;
              }

              .container {
                  width: 650px;
                  margin: 40px auto;
                  background: linear-gradient(145deg, #ffffff, #f0f0f0);
                  border-radius: 12px;
                  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                  overflow: hidden;
                  font-size: 16px;
                  line-height: 1.6;
              }

              /* Header Styles */
              .header {
                  background-color: #0d6efd; /* Blue background */
                  color: #ffffff;
                  padding: 30px;
                  text-align: center;
                  border-bottom: 4px solid #0b5ed7;
              }

              .header img {
                  max-width: 220px;
                  margin-bottom: 15px;
              }

              .header h1 {
                  font-size: 28px;
                  margin: 0;
                  font-weight: bold;
              }

              /* Content Section */
              .content {
                  padding: 30px;
                  color: #495057;
                  background-color: #ffffff;
                  text-align: center;
              }

              .content h2 {
                  font-size: 22px;
                  color: #343a40;
                  margin-bottom: 15px;
              }

              .content p {
                  margin: 10px 0;
                  font-size: 16px;
                  color: #555;
              }

              .otp-box {
                  display: inline-block;
                  margin: 20px auto;
                  padding: 15px 30px;
                  background-color: #f8f9fa;
                  color: #0d6efd;
                  font-size: 20px;
                  font-weight: bold;
                  letter-spacing: 2px;
                  border: 2px dashed #0d6efd;
                  border-radius: 8px;
              }

              /* Button Styles */
              .button-container {
                  margin: 20px 0;
              }

              .button {
                  display: inline-block;
                  padding: 14px 30px;
                  background-color: #28a745; /* Green button */
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 8px;
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
                  color: #0d6efd;
                  text-decoration: none;
              }

              .footer a:hover {
                  text-decoration: underline;
              }

              .divider {
                  width: 100%;
                  height: 1px;
                  background-color: #e9ecef;
                  margin: 20px 0;
              }
          </style>
      </head>
      
      <body>
          <div class="container">
              <div class="header">
                  <img src="https://peopleprudent.com/wp-content/uploads/2021/12/logo-1.png" alt="Logo">
                  <h1>Account Verification</h1>
              </div>
              <div class="content">
                  <h2>Hello, ${username}!</h2>
                  <p>We received a request to verify your account. Please use the OTP below to complete the process:</p>
                  <div class="otp-box">${otp}</div>
                  <p><strong>Note:</strong> This OTP is valid for 2 minutes. Please do not share it with anyone.</p>
                  <div class="divider"></div>
                  <p>If you did not request this, you can safely ignore this email.</p>
                  <p>Thank you for using our services!</p>
              </div>
              <div class="footer">
                  <p>&copy; 2024 People Prudent Consulting and HR Solutions. All rights reserved.</p>
                  <p><a href="https://peopleprudent.com/">Visit our website</a></p>
              </div>
          </div>
      </body>
      
      </html>`;
};

export default otpTemplate;


