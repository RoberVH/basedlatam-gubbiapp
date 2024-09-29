/** Dev ***************************/

/*
const debugAut= function  (req, res, next) {
    //console.log(`Autenticado: ${req.isAuthenticated().toString()} Session:`,JSON.stringify(req.session));
    console.log('-'.repeat(90));
    next()
  }

const unknownError = function (err,req,res)  {
  console.log('ERROR!:',res);
  return;
  //Log error to console
	 res.status(err.status || 500);
	    res.json({
		      errors: {
			        message: err.message,
			        error: err,
			      },
            });
	  };


  module.exports = {
      debugAut,
      unknownError 
  }*/