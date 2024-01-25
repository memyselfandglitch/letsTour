const Review = require('./../model/reviewModel');
const handlerFactory=require('./handlerFactory.js')

exports.getAllReviews=handlerFactory.getAll(Review);
exports.setTourandUser=(req,res,next)=>{
    if(!req.body.tour)req.body.tour=req.params.tourId;
    if(!req.body.user)req.body.user=req.user.id;
    next();
}
exports.createReview=handlerFactory.createOne(Review);
exports.getReview=handlerFactory.getOne(Review,'tour');
exports.updateReview=handlerFactory.updateOne(Review);
exports.deleteReview=handlerFactory.deleteOne(Review);