import { asyncHandler } from '../../utils/asyncHandler.js'
import { ApiError } from '../../utils/ApiError.js'
import { User } from '../../models/users.models.js'
import { ApiResponse } from '../../utils/ApiResponse.js'
import jwt from "jsonwebtoken"
import { OTP } from '../../models/OTP.models.js'
import otpGenerator from 'otp-generator';

//Generate access and refresh token
const generateAccessTokenandRefreshtoken = async (userId) => {
    try {
        const user = await User.findById(userId)

        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500,{}, "Something went wrong while generating access and refresh tokens")
    }
}

// sendOTP
const sendOTP = async (req, res) => {

    try {
        // fetch email from request body
        const { username, email } = req.body;


        // generate opt
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // check unique otp or not
        const result = await OTP.findOne({ otp: otp });


        if (result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
        }

        const otpPayLoad = { email, username, otp };
        // create an entry in db for otp
        const otpBody = await OTP.create(otpPayLoad);

        return res.status(201).json({
            success: true,
            message: "OTP Sent Successfully",
        })
    }
    catch (error) {
        return new ApiError(400,{}, "Could not send OTP")
    }
}

const adminEmailOTP = async (req, res) => {
    try {
        const email = process.env.ADMINEMAIL;
        const username = process.env.ADMINUSERNAME;


        // generate opt
        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // check unique otp or not
        const result = await OTP.findOne({ otp: otp });


        if (result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            })
        }

        const otpPayLoad = { email, username, otp };
        // create an entry in db for otp
        const otpBody = await OTP.create(otpPayLoad);

        return res.status(201).json({
            success: true,
            message: "OTP Sent Successfully",
        })
    }
    catch (error) {
        return new ApiError(400,{}, "Could not send OTP")
    }
}

const verifyAdminEmailOTP = async (req, res) => {

    const { otp } = req.body;
    const email = process.env.ADMINEMAIL;
    const username = process.env.ADMINUSERNAME;

    try {
        // Find the OTP entry for the given username and email
        const OTPsend = await OTP.findOne({ username, email });


        // Check if the OTP entry exists
        if (!OTPsend) {
            throw new ApiError(400,{}, "Verification time expired. Please resend OTP.");
        }

        // Retrieve the stored OTP from the database
        const databaseOtp = OTPsend.otp;




        // Compare the provided OTP with the one stored in the database
        if (databaseOtp !== otp) {
            throw new ApiError(400,{}, "OTP does not match.");
        }

        // OTP matches; respond with a success message and clear the OTP entry if necessary
        await OTP.deleteOne({ username, email });  //  Remove OTP after verification

        const isAdmin = await User.findOne({ email: email });


        if (isAdmin && isAdmin.role === 'admin') {
            const { accessToken, refreshToken } = await generateAccessTokenandRefreshtoken(isAdmin._id);


            const options = {
                httpOnly: true,
                secure: false
            }

            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(
                    new ApiResponse(
                        200,
                        {accessToken, refreshToken},
                        "Email Verified"
                    )
                )
        }

        return res.status(200).json(new ApiResponse(200, {}, "Email Verified"));

    } catch (error) {
        // Send error response if any issues occur
        throw new ApiError(400,{}, "OTP verification failed")
    }
}

const verifyOTP = async (req, res) => {
    const { username, email, otp } = req.body;

    try {
        // Find the OTP entry for the given username and email
        const OTPsend = await OTP.findOne({ username, email });


        // Check if the OTP entry exists
        if (!OTPsend) {
            throw new ApiError(400,{}, "Verification time expired. Please resend OTP.");
        }

        // Retrieve the stored OTP from the database
        const databaseOtp = OTPsend.otp;




        // Compare the provided OTP with the one stored in the database
        if (databaseOtp !== otp) {
            throw new ApiError(400,{}, "OTP does not match.");
        }

        // OTP matches; respond with a success message and clear the OTP entry if necessary
        await OTP.deleteOne({ username, email });  //  Remove OTP after verification

        // const isAdmin = await User.findOne({ email : email });


        // if (isAdmin && isAdmin.role === 'admin') {
        //     const { accessToken, refreshToken } = await generateAccessTokenandRefreshtoken(isAdmin._id);


        //     const options = {
        //         httpOnly: true,
        //         secure: false
        //     }

        //     return res
        //         .status(200)
        //         .cookie("accessToken", accessToken, options)
        //         .cookie("refreshToken", refreshToken, options)
        //         .json(
        //             new ApiResponse(
        //                 200,
        //                 {},
        //                 "Email Verified"
        //             )
        //         )
        // }

        return res.status(200).json(new ApiResponse(200, {}, "Email Verified"));

    } catch (error) {
        // Send error response if any issues occur
        throw new ApiError(400,{}, "OTP verification failed")
    }
};



//Register for new users
const registerUser = asyncHandler(async (req, res) => {


    // taking data from frontend(postman)
    const { username, email, password, confirmpassword, phonenumber } = req.body


    // check validation
    if ([username, email, password, confirmpassword, phonenumber].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400,{}, `All fields is required`)
    }

    // check if the user already existed

    const existedUser = await User.findOne({
        email,
        $and: [{ role: { $in: ['admin'] } }]
    })

    if (existedUser) {
        throw new ApiError(400,{}, "Email already taken")
    }

    const user = await User.create({
        username: username,
        email: email,
        password: password,
        phonenumber: phonenumber,
        role: "admin"
    })


    const createdUser = await User.findById(user._id).select(
        "-refreshToken -confirmpassword -password"
    )


    if (!createdUser) {
        throw new ApiError(400,{}, "Something went wrong while registering the User")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, " Registered User Successfully")
    )

})

//Login for existing users
const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    

    if (!email) {
        throw new ApiError(400,{}, "Email is required")
    }


    const user = await User.findOne({
        $or: [{ email }],
        $and: [{ role: { $in: ['admin'] } }]
    })

    if (!user) {
        throw new ApiError(401,{}, "User does not exist");
    }



    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401,{}, "Wrong Password, please try again!")
    }

    if (user.role !== "admin") {
        throw new ApiError(401,{}, "user not Authorized")
    }

    const { accessToken, refreshToken } = await generateAccessTokenandRefreshtoken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: false
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "Admin logged In Successfully"
            )
        )

})

//Logout for the users
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: false
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

//Generate access token from refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!incomingRefreshToken) {
        throw new ApiError(401,{}, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401,{}, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,{}, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: false
        }

        const { accessToken, newRefreshToken } = await generateAccessTokenandRefreshtoken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401,{}, error?.message || "Invalid refresh token")
    }

})

//Change password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { newPassword, confirmPassword } = req.body

    if (newPassword !== confirmPassword) {
        throw new ApiError(400,{}, "Password and Confirm Password does not match")
    }

    const user = await User.findOne({ "role": "admin" })

    user.password = newPassword
    await user?.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))
});

export { registerUser, loginUser, refreshAccessToken, logoutUser, sendOTP, verifyOTP, changeCurrentPassword, adminEmailOTP, verifyAdminEmailOTP }