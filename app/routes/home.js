'use strict';

exports.index = function(req, res){
  res.render('home/index', {title: 'It\'s a Lake Day', duplicate:false, loginFail:false});
};
