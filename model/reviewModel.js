const mongoose = require('mongoose');
const Tour=require('./tourModel');

const reviewSchema=new mongoose.Schema({
    review:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,required:true
}},
{
  toJSON:{virtuals:true},
  toObject:{virtuals:true}
});

reviewSchema.pre(/^find/,function(next){
    // this.populate({
    //     path:'user',
    //     select:'name photo'
    // }).populate({
    //     path:'tour',
    //     select:'name'
    // })
    this.populate({
        path:'user',
        select:'name photo'
    })
    next();
})

reviewSchema.statics.calcAvgReviews = async function(tourId){
    const stats=await this.aggregate([
        {
            $match:{tour:tourId}
        },{
            $group:{
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}
            }
        }
    ]);
    if(stats.length>0){
    await Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity:stats[0].nRating,
        ratingsAverage:stats[0].avgRating
    })
}
else{
    await Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity:0,
        ratingsAverage:4.5
    })
}   
}

reviewSchema.post('save',function(next){
    this.constructor.calcAvgReviews(this.tour);
    next();
})

reviewSchema.pre(/^findOneAnd/,async function(next){
    this.r=await this.findOne();
    next();
})

reviewSchema.post(/^findOneAnd/,async function(next){
    await this.r.constructor.calcAvgReviews(this.r.tour);
    console.log(this.r);
})

reviewSchema.index({tour:1,user:1},{unique:true});

const Review=mongoose.model('review',reviewSchema);
module.exports=Review;