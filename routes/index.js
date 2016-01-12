var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI);
var Posts = db.get('post');
var Opinion = db.get('opinion')
/* GET home page. */
router.get('/', function(req, res, next) {
  Posts.find({}, function(err, doc){
    if(doc.length > 3){
      var latest = doc.splice(doc.length -3, 3)
    }else {
      var latest = doc;
    }
    console.log(latest);
    res.render('index', { title: 'Express', posts: latest});
  })
});

router.post('/get-post', function (req, res) {
  console.log(req.body);
  Posts.insert({
    title: req.body.title,
    link: req.body.link,
    picURL: req.body.picURL,
    summary: req.body.summary
  })
  res.redirect('/')
});

router.post('/add-opinion', function (req, res) {
  console.log(req.body);
  Opinion.insert({
    articleID: req.body.articleID,
    opinion: req.body.opinion
  }).then(function(){
    res.redirect('/stories/'+ req.body.articleID)
  })
});

router.get('/stories/:id', function(req, res){
  return Posts.findOne({_id: req.params.id}, function(err, doc){
  }).then(function(post){
    Opinion.find({articleID: req.params.id}, function(err, doc){
      var wordCount = {};
      for (var i = 0; i < doc.length; i++) {
        var splitted = doc[i].opinion.split(' ');
        for (var j = 0; j < splitted.length; j++) {
          if(splitted[j] !== "if" && splitted[j] !== "a" && splitted[j] !== "I" && splitted[j] !== "the" && splitted[j] !== "of" && splitted[j] !== "and" && splitted[j] !== "not"  && splitted[j] !== ""){
            if(wordCount.hasOwnProperty(splitted[j]) === false){
              wordCount[splitted[j]] = 1;
            }else{
              wordCount[splitted[j]] ++;
            }
          }
        }
      }
      res.render('stories', {doc: post, ops: doc, wordCount: wordCount})
    })
  })
})
module.exports = router;
