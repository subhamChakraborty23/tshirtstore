const BigPromise = require('../middlewares/bigPromise');

exports.home=BigPromise(async(req,res)=>{
    res.status(200).json({
        success:true,
        message:'Welcome to T-Shirt Store'
    });

})

exports.homeDummy=(req,res)=>{
    res.status(200).json({
        success:true,
        message:'Dummy route'
    });

}