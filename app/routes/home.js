'use strict';

exports.index = function(req, res){
  var login;
  console.log('req.user');
  console.log(req.user);
  if(req.user){
    login = true;
  }else{
    login = false;
  }
  console.log('login');
  console.log(login);
  res.render('home/index', {title: 'It\'s a Lake Day', duplicate:false, login:login});
};
