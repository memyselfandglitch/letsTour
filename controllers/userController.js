const User=require('./../model/userModel.js');
const APIFeatures = require('./../utils/apiFeatures.js');
const handlerFactory=require('./handlerFactory.js')

const filterObj=(obj,...fields)=>{
  const newObj={};
  Object.keys(obj).forEach(key=>{
    if(fields.includes(key)){
      newObj[key]=obj[key];
    }
  })
  
  return newObj;
}

exports.getAllUsers = handlerFactory.getAll(User);

exports.updateMe=async (req,res,next)=>{
  //create error if user posts pwd data
  if(req.body.password){
    res.json({
      status:'failed',
      msg:'cant change pwd like this'
    })
  }
  const filteredBody=filterObj(req.body,'name','email');
  await User.findByIdAndUpdate(req.user.id,filteredBody,{new:true,runValidators:true});
  res.json({
    status:'success'
  })
}

exports.deleteMe=async(req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id,{active:false});
  res.status(200).json({
    status:'success'
  })
}

exports.getUser =handlerFactory.getOne(User);
exports.updateUser = handlerFactory.updateOne(User);
exports.deleteUser=handlerFactory.deleteOne(User);
