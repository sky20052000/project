const mongoose = require("mongoose");

const registerSchema = new mongoose.Schema({
    fullname:{
        type:String,
      
    },

    lastname:{
        type:String,
        required:true
    },

    email:{
        type:String,
       
    },

    password:{
        type:String,
        
    },

    date_birth:{
        type:String,
        required:true,
        unique:true
    },

    gender:{
        type:String,
        required:true
    },
    
    date:{
        type:Date,
        default:Date.now
    }
});

//creating collection

const Register = new mongoose.model("Register",registerSchema);

module.exports = Register;