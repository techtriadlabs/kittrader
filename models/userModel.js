const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema({

    name :{
        type: String,
        require:true,
    },
    email :{
        type: String,
        require:true,
        unique: true,
    },
    number :{
        type: String,
        require:true,
        unique: true,
    },
    role :{
        type: String,
        default:'user',
    },
    membershiptype :{
        type: String,
        default:'none',
    },
    password :{
        type: String,
        require:true,
    },
});

const User = mongoose.model('User',userSchema);

module.exports = User;