const mongoose = require('mongoose');
const validator=require('validator');
const crypto=require('crypto');
const bcrypt=require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique:true,
        lowercase:true,
        validate: [validator.isEmail],
    },
    photo:{
        type:String,
    },
    password:{
        type:String,
        required: true,
        minlength:[8,'min len is 8'],
        select:false
    },
    passwordConfirm:{
        type:String,
        required: true,
        validator:{
            validator: function(el){
               return this.password===el;
            }
        },
        message:'passwords not same'
    },
    passwordChangedAt:{
        type:Date
    },
    role:{
        type:String,
        enum:['admin','user','guide','lead-guide'],
        default:'user'
    },
    resetPwdToken:String,
    resetPwdExpires:Date,
    active:{
        type:Boolean,
        default:true,
        select:false
    }
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password'))return next();
    this.password=await bcrypt.hash(this.password,12);
    this.passwordConfirm = undefined;
    next();
})

userSchema.pre('save',async function(next){
    if(!this.isModified('password')||this.isNew)return next();
    this.passwordChangedAt=Date.now()-1000;
    next();
})

userSchema.pre(/^find/,function(next){
    this.find({active:{$ne:false}});
    next();
})

userSchema.methods.correctPassword=async function(unhashedInput,userPassword,next){
    return await bcrypt.compare(unhashedInput,userPassword);
    next();
}

userSchema.methods.changedPasswordAfter = (jwtTimestamp)=>{
    if(this.passwordChangedAt){
        const changedTime=parseInt(this.passwordChangedAt.getTime(),10);
        return jwtTimestamp<changedTime;
    }
    
    return false;
}

userSchema.methods.createPasswordResetToken=function(){
    const resetToken=crypto.randomBytes(32).toString('hex');
    this.resetPwdToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPwdExpires=Date.now()+10*60*1000;
    console.log({resetToken},this.resetPwdToken);
    return resetToken;
}

const User = mongoose.model('User',userSchema);
module.exports=User;