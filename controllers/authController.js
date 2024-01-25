const jwt=require('jsonwebtoken');
const {promisify}=require('util');
const User = require('./../model/userModel.js');
const APIFeatures = require('./../utils/apiFeatures.js');
const sendMail=require('./../utils/email.js');
const crypto=require('crypto');

const signToken=(id)=>{
    return jwt.sign({id:id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});
}

const createSendToken=(user,statusCode,res)=>{
    const token =signToken(user._id);

    const cookieOptions={
        expires:new Date(Date.now()+process.env.COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly:true
    }
    if(process.env.NODE_ENV==='production')cookieOptions.secure=true;
    res.cookie('jwt',token, cookieOptions);

    user.password=undefined;

    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
}

exports.getMe = async(req,res,next)=>{
    req.params.id=req.user.id;
    next();
}

exports.signup = async(req,res,next)=> {
    try{
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt,
        role: req.body.role,
        resetPwdToken:req.body.resetPwdToken,
        resetPwdExpires:req.body.resetPwdExpires
    });

    createSendToken(newUser,200,res);
    next();
    }
    
    catch(err){
        res.status(500).json({
            status:'failed',
            message: 'error in creating user'
        })
    }

}

exports.login=async(req,res,next)=>{
    try{ 
    const {email,password}=req.body;
    //check if email and pwd actually exist
    if(!email||!password){
        res.status(400).json({
            status:' username or password missing'
        })
    }

    //check if user exists and pwd is correct
    const user=await User.findOne({email}).select('+password');
    const chk=await user.correctPassword(password,user.password);
    if(!user||!chk){
        res.status(400).json({
            status:'failed auth'
        })
    }

    createSendToken(user,200,res);
    next();
}catch(err){
    console.log(err);
}

}


exports.protect=async(req,res,next)=>{
    try{
        let token;
        //get current token and check if its there
        if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer')){
            token = req.headers.authorization.split(' ')[1];

        }
        // console.log(token);
        if(!token)res.status(401).json({
            status:'failedd'
        })

        //verification token
        const decodedPayload=await promisify(jwt.verify)(token,process.env.JWT_SECRET);
        console.log(decodedPayload);
        //check if user exists
        const user =await User.findOne({_id:decodedPayload.id});
        // console.log(user);
        // console.log(user.passwordChangedAt);
        if(!user){
            res.status(404).json({status:'failed no user found'})
        }
        if(user.changedPasswordAfter(decodedPayload.iat)){
            json.status(401).json({
                msg:'failed',
                status:'password changed after token generated'
            })
        }
//grant access to protected route
        req.user=user;
    next();
    }catch(err){
        console.log(err);
        res.json({
            status:'failed'
        })
    }
}

exports.restrictTo = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            res.json({
                status:'failed permission access'
            })
        }
        next();
    }
}

exports.forgotPassword=async (req,res,next)=>{
    //get user based on email;
        const user=await User.findOne({email:req.body.email});
        if(!user){
            res.json({
                status:'no user found'
            })
        }
        //generate random reset token
        const resetToken=user.createPasswordResetToken();
        await user.save({validateBeforeSave:false});
        console.log(user)
        const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        const msg=`The url for patch req of pwd is ${resetURL}. IGnore if not requested`;
        console.log(msg);
        try{
            await sendMail({
                email:user.email,
                message:msg,
                subject:'link for pwd reset valid 10 mins'
            });
            res.status(200).json({
                status:'mail sent'
            })}
        catch(err){
            user.resetPwdToken=undefined;
            user.resetPwdExpires=undefined;
            await user.save({validateBeforeSave:false});
            console.log('email failed');
            return res.json({
                status:'failed'
            })
        }
    
}

exports.resetPassword=async(req,res,next)=>{
     //get user based on token
     const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
     const user=await User.findOne({resetPwdToken:hashedToken,resetPwdExpires:{$gt:Date.now()}});
     
     //if not expired ans user exists set new password
     if(!user){
        res.json({status:'too late or not exist'})
     }

     //update changedPwdAt for user
     user.password=req.body.password;
     user.passwordConfirm=req.body.passwordConfirm;
     user.resetPassword=undefined;
     user.resetPwdExpires=undefined;

     await user.save();

     createSendToken(user,200,res);
     console.log(user);


     //log user in and send jwt
}

exports.updatePassword=async (req,res,next)=>{
    const user=await User.findById(req.user.id).select('+password');

    const chk=await user.correctPassword(req.body.password,user.password);
    if(user&&chk){
        user.password=req.body.newPassword;
        user.passwordConfirm=req.body.newConfirmPassword;
        await user.save();
        createSendToken(user,200,res);
    }
    else res.json({
        status:'failed to update password'
    })

}