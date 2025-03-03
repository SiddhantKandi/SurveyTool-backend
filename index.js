import dotenv from "dotenv"
import app from './src/app.js'
import connectDB from './src/db/index.js'

dotenv.config({
    path: './.env'
})

connectDB()
    .then(() => {

        app.on("error", (error) => {
            console.log("Connection failed to run MongoDB server", error);
            throw error
        })

        app.listen(process.env.PORT || 8000,  () => {
            console.log(`Server is running at  port ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MongoDB connection failed!!!", err)
    })


