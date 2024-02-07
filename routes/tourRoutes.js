const express = require('express');
const tourController = require('./../controllers/tourController');
const authController=require('./../controllers/authController')
const reviewController=require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();

router.use('/:tourId/reviews',reviewRouter);

// router.param('id', tourController.checkID);
router
  .route('/top-5-cheap').get(tourController.aliasTopTour,tourController.getAllTours);

router
  .route('/get-tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year').get(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.createTour);

router
  .route('/tours-within/:dist/center/:latlng/unit/:unit').get(tourController.getToursWithin);

router
  .route('/distances/:latlng/unit/:unit').get(tourController.getDistances);  

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.updateTour)
  .delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour);


module.exports = router;
