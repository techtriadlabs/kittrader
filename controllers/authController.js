const bcrypt = require ('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const createError = require('../utils/appError');
const unirest = require('unirest');
const OTP = require('../models/otpModel');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// Function to generate a random OTP
const generateOTP = () => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};

exports.signup = async (req, res, next) => {
    try {
        // Validate and sanitize request body using express-validator
        await Promise.all([
            // Validate and sanitize each field using the express-validator chain
            body('email').trim().notEmpty().isEmail().escape(),
            body('number').trim().notEmpty().isNumeric().escape(),
            body('password').trim().notEmpty().escape(),
            body('name').trim().notEmpty().escape()
        ].map(validation => validation.run(req)));

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        // Check if the user email already exists
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            return next(new createError('User email already exists!', 400));
        }

        // Check if the user number already exists
        const userNumber = await User.findOne({ number: req.body.number });
        if (userNumber) {
            return next(new createError('User number already exists!', 400));
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, 12);

        // Create a new user
        const newUser = await User.create({
            ...req.body,
            password: hashedPassword,
        });

        // Generate JWT token
        const token = jwt.sign({ _id: newUser._id }, process.env.JWT, {
            expiresIn: '1h',
        });

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            token,
            newUser: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                number: newUser.number,
                role: newUser.role,
            },
        });

    } catch (error) {
        next(error);
    }
};


exports.login = async (req, res, next) =>{

    try{
        // Validate and sanitize request body using express-validator
        await Promise.all([
            // Validate and sanitize each field using the express-validator chain
            body('email').trim().isEmail().escape(),
            body('password').trim().notEmpty().escape()
        ].map(validation => validation.run(req)));

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const {email, password} = req.body;

        const user = await User.findOne({email});

        if(!user) return next (new createError ('user not found!', 404));

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return next (new createError ('Incorrect email or password ',401));

        }
        const token = jwt.sign({_id: user._id}, process.env.JWT,{
            expiresIn:'1h',
        });

        res.status(201).json({
            status: 'success',
            message:'User login sucessfully',
            token,
            user:{
                _id:user._id,
                name:user.name,
                email:user.email,
                number:user.number,
                role:user.role,
                membership: user.membershiptype

            } ,
            
        })

    }catch(error){
        next(error);
    }
};



exports.forgotPassword = async (req, res, next) => {
    try {
        const { number } = req.body;
        const user = await User.findOne({ number });
        if (!user) return next(new createError('User not found!', 404));

        const OTPCode = generateOTP(); // Generate a random OTP

        // Save OTP to database
        const otpData = new OTP({
            userId: user._id,
            number: user.number,
            otp: OTPCode,
        });
        await otpData.save();

        const message = `Your OTP for password reset is: ${OTPCode}`;

        // Send OTP via SMS using fast2sms API
        const reqSMS = unirest("GET", "https://www.fast2sms.com/dev/bulkV2");
        reqSMS.query({
            "authorization": process.env.FAST2SMS_API_KEY, // Use your API key here
            "variables_values": OTPCode,
            "route": "otp",
            "numbers": user.number, // Send OTP to user's number
        });
        reqSMS.headers({ "cache-control": "no-cache" });

        reqSMS.end(function (resSMS) {
            if (resSMS.error) {
                return next(new createError('Failed to send OTP!', 500));
            } else {
                res.status(200).json({
                    status: 'success',
                    message: 'OTP sent successfully for password reset.',
                });
            }
        });
    } catch (error) {
        next(error);
    }
};

// Function to verify OTP
exports.verifyOTP = async (req, res, next) => {
    try {
        const { number, otp, newPassword } = req.body;
        const otpData = await OTP.findOne({ number, otp });
        if (!otpData) return next(new createError('Invalid OTP!', 400));

        // Check if OTP has expired
        const currentTime = new Date();
        if (otpData.createdAt.getTime() + 10 * 60 * 1000 < currentTime.getTime()) {
            return next(new createError('OTP has expired!', 400));
        }

        // Find the user by userId and update the password
        const user = await User.findById(otpData.userId);
        if (!user) return next(new createError('User not found!', 404));

        // Update user's password
        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();

        // Delete the OTP data from the database
        await OTP.deleteOne({ _id: otpData._id });

        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully.',
        });
    } catch (error) {
        next(error);
    }
};
