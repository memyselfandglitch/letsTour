const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('./userModel');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  duration: {
    type: Number,
    required: [true,'must have duration']
  },
  maxGroupSize: {
    type: Number,
    required: true
  },
  difficulty:{
    type: String,
    required: true
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    set:val=>Math.round(val*10)/10
  },
  ratingsQuantity: {
    type: Number,
    default:0
  },
  price: {
    type: Number,
    required: true
  },
  priceDiscount:{
    type: Number,
    validate:function(val){
      return this.price>val
    }
  } ,
  summary: {
    type: String,
    trim: true,
    required: true,
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: true
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now()
  },
  startDates: [Date],
  slug:String,
  secretTour:{
    type:Boolean,
    default:false
  },
  startLocation: {
    type:{
      type:String,
      default:'Point',
      enum: ['Point']
    },
    coordinates:[Number],
    address:String,
    description:String
  },
  locations: [
    {
      type:{
        type:String,
        default: 'Point',
        enum:['Point']
      },
      coordinates:[Number],
      address:String,
      description: String,
      day:Number
    }
  ],
  guides:[
    {
      type:mongoose.Schema.ObjectId,
      ref:'User'
    }
  ],
},
  {
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
  }
);

tourSchema.index({price:1, ratingsAverage:-1});
tourSchema.index({startLocation: '2dsphere'});

tourSchema.virtual('durationWeeks').get(function(){
  return this.duration/7;
});

tourSchema.virtual('reviews',{
  ref:'review',
  foreignField: 'tour',
  localField: '_id'
})

tourSchema.pre('save',function(next){
  this.slug=slugify(this.name,{lower:true})
  next();
})

// tourSchema.pre('save', async function(next){
//   const guidesPromises=this.guides.map(async id=>await User.findById(id));
//   this.guides=await Promise.all(guidesPromises);
//   next();
// })

tourSchema.pre(/^find/,function(next){
  this.populate({
    path:'guides',
    select:'-__v'
  });
  next();
})

tourSchema.pre(/^find/,function(next){
  this.find({secretTour:{$ne:true}});
  this.start=Date.now();
  next();
})

tourSchema.post(/^find/,function(docs,next){
  console.log(`query took ${Date.now()-this.start} milli secs`)
  next();
})

// tourSchema.pre('aggregate',function(next){
//   console.log(this);
//   this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
//   next();
// })

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
