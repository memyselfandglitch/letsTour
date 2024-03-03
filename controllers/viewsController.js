const Tour=require('./../model/tourModel');
const User=require('./../model/userModel');

exports.getOverview=async(req,res)=>{
    //get tour data from collection
    const tours=await Tour.find();
    //build template

    //render template from tour data from step 1
    res.status(200).render('overview',{title:'All Tours',tours});
}

exports.getTour=async (req,res,next)=>{
    //get the data for the requested tour inc reviews and guides
    const tour=await Tour.findOne({slug:req.params.slug}).populate({
        path:'reviews',
        fields:'review rating user'
    })
    //build template

    //render template using data from step 1

    res
    .status(200)
    .set(
        'Content-Security-Policy',
        "default-src 'self' https://cdnjs.cloudflare.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });

    next();
}

exports.getLoginForm = (req,res)=>{
    res.status(200).render('login',{
        title:'log in to your account'
    })
}
exports.getSignupForm=(req,res)=>{
    res.status(200).render('signup',{
        title:'sign up now'
    })
}