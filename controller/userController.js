

var http = require("http");
const User = require("../models/user")
const Register = require("../models/registerUser");
const  Otp = require("../models/otpModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const _ = require("lodash");
const generateOTP = require("otp-generator");
const {Oauth2client} = require("google-auth-library");
const config = require("../config/config.json");
//const client  = new Oauth2client("518670493403-8a678kn781a5epudrg4fphm04lbogmmc.apps.googleusercontent.com");
const userController = {
  loginUser:async(req,res)=>{
    try{
      //console.log(req.body.phoneN);
      const user = await User.findOne({
        phoneN: req.body.phoneN
      });
      if(user){
        return res.status(400).json({msg:"phone number  already exists"})
      }
     
      const OTP = generateOTP.generate(4,{
        digits:true,
        alphabets:false,
        upperCase:false,
        specialChars:false
      });
      const phoneN = req.body.phoneN;
     // console.log(OTP);
      console.log(phoneN);
////////////////////////////////////////////

var options = {

  "method": "POST",

  "hostname": "2factor.in",

  "port": null,

  "path": "https://2factor.in/API/V1/c7573668-cfde-11ea-9fa5-0200cd936042/SMS/{phoneN}/AUTOGEN",

  "headers": {}

};

    

var req = http.request(options, function (res) {

  var chunks = [];

  res.on("data", function (chunk) {

    chunks.push(chunk);

  });
  res.on("end", function () {

    var body = Buffer.concat(chunks);

    var obj = JSON.parse(body);

    console.log(obj.Details);

  });

});

req.write("{}");

req.end();

      //
      const otp = new Otp({phoneN:phoneN,otp:OTP});
      const salt = await bcrypt.genSalt(10);
       otp.otp =  await bcrypt.hash(otp.otp,salt);
      await otp.save();
      return res.status(200).json({msg:"Otp successfully send"});

    }catch(err){
     return res.status(500).json({msg:err.message})
    }
  },

  // verifyOtp 
  verifyOtp:async(req,res)=>{
    try{
     // console.log(req.body.phoneN);
      const otpHolder = await Otp.find({
        phoneN:req.body.phoneN
      })
      
      if(otpHolder.length === 0) return res.status(400).send("You use an expired otp");
      const rightOtp = otpHolder[otpHolder.length -1];
      const validUser = await bcrypt.compare(req.body.otp, rightOtp.otp);
      if(rightOtp.phoneN === req.body.phoneN && validUser){
        const user = new User(_.pick(req.body,["phoneN"]));
        const token = user.generateJwt();
        const result = await user.save();
        const otpDelete = await Otp.deleteMany({
          phoneN:rightOtp.phoneN
        });
        console.log(result);
        console.log(token);
        return res.status(200).send({
          msg:"User login Successful",
          token:token,
          data:result
        });
      }else{
        return res.status(400).json({msg:"Your otp was wrong"});
      }
    }catch(err){
      return res.status(500).json({msg:err.message});
    }
   
  },
  
    //userProfile route /users/userProfile
    userProfile:async(req,res)=>{
        try{
           console.log(req.body);
           const {fullname, lastname,email, date_birth,gender} = req.body;
           const validate = validator.isEmail(email);
           if(!validate){
               return res.status(400).json({msg:"Invalid Email"});
           }
           const  user = await Register.findOne({email});
           if(user){
               return res.status(400).json({msg:"User already exists"});
           }
           //const passwordhash = await bcrypt.hash(password, 10);
           const newUser = new Register({
               fullname:fullname,
               lastname:lastname,
               email:email,
               //password:passwordhash,
               date_birth:date_birth,
               gender:gender
           });
           if(newUser == 0 ){
               return res.status(0).json({msg:"User is not active"});
           }
           await newUser.save();
           return res.status(201).json({msg:"Success"});
        }catch(err){
            return res.status(500).json({msg:err.message});
        }
    },
   //data list
    dataList:async(req,res)=>{
      try{
        console.log(req.body);
        const data = await Register.find();
        return res.status(200).json({
            message:"success",
            data:data
        })
      }catch(err){
          return res.status(500).json({msg:err.message}); 
      }
  },
  

    // login with google

    //client id :518670493403-8a678kn781a5epudrg4fphm04lbogmmc.apps.googleusercontent.com
    // secret_key :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


}
module.exports = userController;

