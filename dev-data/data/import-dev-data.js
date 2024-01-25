const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./../../model/userModel.js');
const Review=require('./../../model/reviewModel.js');
const Tour = require('./../../model/tourModel.js')
const fs = require('fs');

const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const review = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE;

mongoose
  .connect(db, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
  })
  .then(()=>console.log('connection successful'))
  .catch((err) => console.log(err));

const importData = async()=>{
    try{
    await User.create(user,{validateBeforeSave:false});
    await Review.create(review);
    await Tour.create(tour);
    process.exit();
    }
    catch(err){
        console.log(err);
    }
}

const deleteData = async()=>{
    try{
        await User.deleteMany();
        await Review.deleteMany();
        await Tour.deleteMany();
        process.exit();
        }
        catch(err){
            console.log(err);
        }
}

console.log(process.argv);

if(process.argv[2] === '--import'){
    importData();
}

else if(process.argv[2] === '--delete'){
    deleteData();
}

