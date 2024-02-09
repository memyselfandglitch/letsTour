const APIFeatures=require('./../utils/apiFeatures');

exports.deleteOne = Model =>async (req,res,next)=>{
    const doc=await Model.findByIdAndDelete(req.params.id);
     res.status(204).json({
        status:'successfully deleted'
    })
}

exports.updateOne = Model => async (req, res,next) => {
    try{
      //Tour.findOne({_id:req.params.id})
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators: true
      });
      res.status(200).json({
        status:'success',
        doc
      })
    }
    catch(err){
      res.status(404).send({
        status:'failed'
      })
    }
  };

  exports.createOne = Model =>async (req,res,next)=>{
    try{
        const doc = await Model.create(req.body); 
        res.status(201).json({
          status: 'success',
          data: {
            doc
          }
        });
      }
        catch(err){
          console.log(err);
          res.status(400).json({
            message:'failed',
            message:err
          })
        }
  }

  exports.getOne =(Model,popOptions)=> async (req, res) => {
    try{
      //Tour.findOne({_id:req.params.id})
      let query=await Model.findById(req.params.id);
      if(popOptions)query = await query.populate(popOptions);
      res.status(200).json({
        status:'success',
        data:query
      })
    }
    catch(err){
      console.log(err);
      res.status(404).json({
        status:'failed'
      })
    }
  }

  exports.getAll=Model => async (req, res) => {
    try{
    console.log(req.query);
    let filter={};
    if(req.params.tourId)filter={tour:req.params.tourId};
  
    const features=new APIFeatures(Model.find(filter),req.query).filter().sort().limitFields().paginate();
    const doc=await features.query;
  
    res.status(200).json({
      status: 'success',
      results: doc.length,
      doc
    });
  }catch(err){
    res.status(404).json({
      status:'failed',
      msg: err
    })
  }
  };