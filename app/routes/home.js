'use strict';

exports.index = function(req, res){
  var login;
  if(req.user){
    login = true;
  }else{
    login = false;
  }
  res.render('home/index', {title: 'It\'s a Lake Day', duplicate:false, login:login, userId:req.session.userId});
};
