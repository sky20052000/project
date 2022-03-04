const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("../config/config.json");
const userSchema = new mongoose.Schema({
   
    phoneN:{
        type: String,
        
    },

    date:{
        type:Date,
        default:Date.now
    },
},
    { timestamps: true }
);

userSchema.methods.generateJwt = ()=>{
    const  token = jwt.sign({
        //id = this._id,
        phoneN:this.phoneN
    }, config.JWT_SECRET);
    return token;
 }

// creating model
const User = new mongoose.model("User",userSchema);
module.exports = User;