# 📊 SurveyTool Backend

This is the backend of the SurveyTool application — a platform to create, distribute, and analyze surveys. It is built with **Node.js**, **Express**, and **MongoDB**.

---

## 🛠️ Getting Started

Follow these steps to get the backend server up and running locally:

### 📦 1. Clone the Repository

```bash
git clone https://github.com/SiddhantKandi/SurveyTool-backend.git
cd SurveyTool-backend
```


📥 2. Install Dependencies
Make sure you have Node.js and npm installed, then run:

```bash
npm install
```

⚙️ 3. Create .env File
Create a .env file in the root directory of the project and add the following environment variables:

```bash
PORT
CORS_ORIGIN
SURVEY_BASEURL
EMAILUSERNAME
EMAILPASS
ADMINEMAIL
ADMINUSERNAME
MONGODB_URI
DB_NAME
ACCESS_TOKEN_SECRET
ACCESS_TOKEN_EXPIRY 
REFRESH_TOKEN_SECRET 
REFRESH_TOKEN_EXPIRY
AZURE_SUBSCRIPTION_KEY
GEOENCODING_API
```

▶️ 4. Start the Development Server

```bash
npm run dev
```
