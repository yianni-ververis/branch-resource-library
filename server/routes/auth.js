var express = require('express'),
    router = express.Router(),
    passport = require('passport');

router.post('/login', passport.authenticate('local',{successRedirect: '/', failureRedirect: ''}));

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.post('/signup', passport.authenticate('signup'), function(req, res){
  res.redirect('/')
});

module.exports = router;
