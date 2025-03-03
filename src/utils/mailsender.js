import nodemailer from "nodemailer";
import {ApiError} from '../utils/ApiError.js'

const mailSender = async (email, title, body) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAILUSERNAME,
              pass: process.env.EMAILPASS
            },
          });

        let info = await transporter.sendMail({
            from: process.env.EMAILUSERNAME,
            to:  `${email}`,
            subject: `${title}`,
            html: `${body}`,
        })
        return info;
    }
    catch(error) {
        throw new ApiError(400,{},"Could not send Email , please try again");
    }
}

export default mailSender;