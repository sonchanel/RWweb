var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('About', { title: 'Express' ,
    message: 'Hello, World!',
    A : ['1','2','3']
  });
});


module.exports = router;
