import mongoose from 'mongoose';
import mailSender from "../utils/mailsender.js";
import emailTemplate from "../mail/emailVerificationTemplate.js"

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    username : {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: 120 }
    }
})

// a function -> to send emails
async function sendVerificationEmail(email,username, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification email from Survey Sphere", emailTemplate(username,otp))
    }
    catch(error) {
        throw error;
    }
}

OTPSchema.pre("save", async function(next) {
    await sendVerificationEmail(this.email,this.username, this.otp);
    next();
})

export const OTP = mongoose.model("OTP", OTPSchema);
