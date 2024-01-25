const { query } = require('express');
const Tour = require('./../model/tourModel.js');
const APIFeatures = require('./../utils/apiFeatures.js');
const handlerFactory=require('./handlerFactory.js')
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

exports.aliasTopTour =  (req,res,next) =>{
    req.query.limit='5';
    req.query.sort='-ratingsAverage , price';
    req.query.fields='name,price,ratingsAverage,summary';
    next();

}
exports.getAllTours = handlerFactory.getAll(Tour);
// exports.getAllTours = async (req, res) => {
//   try{
//   console.log(req.query);

//   const features=new APIFeatures(Tour.find(),req.query).filter().sort().limitFields().paginate();
//   const tours=await features.query;

//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     tours
//   });
// }catch(err){
//   res.status(404).json({
//     status:'failed',
//     msg: err
//   })
// }
// };
exports.getTour=handlerFactory.getOne(Tour,'reviews');
// exports.getTour = async (req, res) => {
//   try{
//     //Tour.findOne({_id:req.params.id})
//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     res.status(200).json({
//       status:'success',
//       data:tour
//     })
//   }
//   catch(err){
//     console.log(err);
//     res.status(404).json({
//       status:'failed'
//     })
//   }
// }
exports.getTourStats = async (req, res) => {
    try{
      //Tour.findOne({_id:req.params.id})
      const stats = await Tour.aggregate([
        {
          $match:{ratingsAverage:{$gte:4.5}}
        },
        {
          $group:{
            _id:'$difficulty',
            numTours: {$sum:1},
            numRatings: {$sum:'$ratingsQuantity'},
            avgRating:{$avg:'$ratingsAverage'},
            avgPrice:{$avg:'$price'},
            minPrice:{$min:'$price'},
            maxPrice:{$max:'$price'},
        },
      },
        {
          $sort: {avgPrice:1}
        }
      
      ]);
      res.status(200).json({
        status:'success',
        data:stats,
    })
    }
    catch(err){
      console.log(err);
      res.status(404).json({
        status:'failed'
      })
    }

  //res.status(200).json({
  // status: 'success' ,
  // data: {
  //   tour
  // }
  //});
};

exports.getMonthlyPlan = async (req,res) =>{
  try{
    const year=req.params.year*1;
    const plan=await Tour.aggregate([
      {
        $unwind : '$startDates'
      },
      {
        $match : {
          startDates: {
            $gte:new Date(`${year}-01-01`),
            $lte:new Date(`${year}-12-31`)
        }}
      },
      {
        $group:{
          _id: {$month: '$startDates'},
          monthCnt:{$sum:1},
          tours :{$push:'$name'}
        }
      },
      {
        $addFields:{
          month:'$_id'
        }
      },
      {
        $sort: {monthCnt:-1}
      }
    
    ])

    res.status(200).json({
      status:'success',
      val:plan.length,
      data:plan,
  })

  }
  catch(err){
    res.status(400).json({
      message:'failed',
      message:err
    })
  }
}

exports.createTour=handlerFactory.createOne(Tour);
// exports.createTour = async (req, res) => {
//   // console.log(req.body);
//   try{
//   const newTour = await Tour.create(req.body); 
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
// }
//   catch(err){
//     console.log(err);
//     res.status(400).json({
//       message:'failed',
//       message:err
//     })
//   }
// };

exports.updateTour=handlerFactory.updateOne(Tour);
// exports.updateTour = async (req, res) => {
//   try{
//     //Tour.findOne({_id:req.params.id})
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,{
//       new:true,
//       runValidators: true
//     });
//     res.status(200).json({
//       status:'success',
//       data:tour
//     })
//   }
//   catch(err){
//     console.log(err);
//     res.status(404).send({
//       status:'failed'
//     })
//   }
// };

exports.deleteTour=handlerFactory.deleteOne(Tour);
// exports.deleteTour = async (req, res) => {
//   try{
//     //Tour.findOne({_id:req.params.id})
//     await Tour.findByIdAndDelete(req.params.id);
//     res.status(200).json({
//       status:'success',
//     })
//   }
//   catch(err){
//     console.log(err);
//     res.status(404).send({
//       status:'failed'
//     })
//   }

// };
