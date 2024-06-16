const Data = require('../models/dataModel');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const createError = require('../utils/appError');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

exports.create = async (req, res, next) => {
    try {
        // Extract token from request headers
        const token = req.headers.authorization;

        if (!token) {
            return next(new createError('Authorization token not provided!', 401));
        }

        // Decode JWT token
        const decodedToken = jwt.verify(token, process.env.JWT);

        // Check if decoded token contains user ID
        if (!decodedToken._id) {
            return next(new createError('Invalid token!', 401));
        }

        // Fetch user ID from decoded token
        const userId = decodedToken._id;

        // Check if the user is an admin
        const user = await User.findById(userId); 
        if (!user || user.role !== 'admin') {
            return next(new createError('Unauthorized! Only admins can create data entries.', 403));
        }
        
        // Validate and sanitize request body using express-validator
        await Promise.all([
            // Validate and sanitize each field using the express-validator chain
            body('index').trim().notEmpty().escape(),
            body('from').trim().notEmpty().escape(),
            body('title').trim().notEmpty().escape(),
            body('description').trim().notEmpty().escape(),
            body('entryPoint').trim().escape(),
            body('stopLoss').trim().escape(),
            body('profit1').trim().escape(),
            body('profit2').trim().escape()
        ].map(validation => validation.run(req)));

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        // If the user is an admin, proceed with creating the data entry
        const { index, from, title, description, entryPoint, stopLoss, profit1, profit2 } = req.body;

        // Create data entry
        const newData = await Data.create({
            index,
            from,
            title,
            description,
            entryPoint,
            stopLoss,
            profit1,
            profit2
        });

        res.status(201).json({
            status: 'success',
            data: {
                data: newData
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.history = async (req, res, next) => {
    try {
        // Extract token from request headers
        const token = req.headers.authorization;

        if (!token) {
            return next(new createError('Authorization token not provided!', 401));
        }

        // Decode JWT token
        const decodedToken = jwt.verify(token, process.env.JWT);

        // Check if decoded token contains user ID
        if (!decodedToken._id) {
            return next(new createError('Invalid token!', 401));
        }

        // Fetch user ID from decoded token
        const userId = decodedToken._id;

        // Fetch the user
        const user = await User.findById(userId);
        
        // Retrieve data history regardless of user role
        const history = await Data.find({});
        
        // Return the history
        return res.status(200).json({
            status: 'success',
            data: {
                history
            }
        });
        
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        // Extract token from request headers
        const token = req.headers.authorization;

        if (!token) {
            return next(new createError('Authorization token not provided!', 401));
        }

        // Decode JWT token
        const decodedToken = jwt.verify(token, process.env.JWT);

        // Check if decoded token contains user ID
        if (!decodedToken._id) {
            return next(new createError('Invalid token!', 401));
        }

        // Fetch user ID from decoded token
        const userId = decodedToken._id;

        // Fetch the user
        const user = await User.findById(userId);

        // Check if the user is an admin
        if (!user || user.role !== 'admin') {
            return next(new createError('Unauthorized! Only admins can update data entries.', 403));
        }

        // Validate and sanitize request body using express-validator
        await Promise.all([
            // Validate and sanitize each field using the express-validator chain
            body('index').trim().notEmpty().escape(),
            body('from').trim().notEmpty().escape(),
            body('title').trim().notEmpty().escape(),
            body('description').trim().notEmpty().escape(),
            body('entryPoint').trim().escape(),
            body('stopLoss').trim().escape(),
            body('profit1').trim().escape(),
            body('profit2').trim().escape()
        ].map(validation => validation.run(req)));

        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { index, from, title, description, entryPoint, stopLoss, profit1, profit2, updateId } = req.body;

        // Find the data entry by ID and update it
        const updatedData = await Data.findByIdAndUpdate(updateId, {
            index,
            from,
            title,
            description,
            entryPoint,
            stopLoss,
            profit1,
            profit2
        }, { new: true }); // Setting { new: true } ensures the updated document is returned

        // Check if the data entry exists
        if (!updatedData) {
            console.log(updateId)
            return next(new createError('Data entry not found!', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: updatedData
            }
        });
    } catch (error) {
        next(error);
    }
};





