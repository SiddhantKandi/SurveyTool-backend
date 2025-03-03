import mongoose from 'mongoose';

//Using async because it is asynchrounous code (it will take time to execute)
const connectDB = async () => {
    //try beacuse the following process can have error
    try {
        const connectionInstance = await mongoose.connect
            (`${process.env.AZURE_COSMOS_CONNECTIONSTRING || process.env.MONGODB_URI}${process.env.DB_NAME}`)
        console.log(`\n MongoDB connected!!!DB Host:${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB coonection error : ", error);
        process.exit(1)
    }
}


export default connectDB