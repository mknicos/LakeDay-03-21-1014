'use strict';

process.env.DBNAME = 'item-test';
var app = require('../../app/app');
var request = require('supertest');
var fs = require('fs');
var exec = require('child_process').exec;
//var expect = require('chai').expect;
var User, Boat;
var cookie;
var matt;

describe('boats', function(){

  before(function(done){
    request(app)
    .get('/')
    .end(function(err, res){
      User = require('../../app/models/user');
      Boat = require('../../app/models/boat');
      done();
    });
  });

  beforeEach(function(done){
    global.nss.db.dropDatabase(function(err, result){
      var userObj = {userName: 'Matt Knicos', email: 'mknicos@gmail.com', password: '1234'};
      matt = new User(userObj);
      matt.register(function(){
        done();
      });
    });
  });

  describe('AUTHORIZED', function(){
    beforeEach(function(done){
      request(app)
      .post('/login')
      .field('email', 'mknicos@gmail.com')
      .field('password', '1234')
      .end(function(err, res){
        cookie = res.headers['set-cookie'];
        done();
      });
    });
    describe('POST /boats', function(){
      before(function(done){
        var testdir = __dirname + '/../../app/static/img/boats/test*';
        var cmd = 'rm -rf ' + testdir;

        exec(cmd, function(){
          var origfile = __dirname + '/../fixtures/guitarBoat.jpg';
          var copyfile = __dirname + '/../fixtures/guitarBoat-copy.jpg';
          var copyfile2 = __dirname + '/../fixtures/guitarBoat-copy2.jpg';
          fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile));
          fs.createReadStream(origfile).pipe(fs.createWriteStream(copyfile2));
          global.nss.db.dropDatabase(function(err, result){
            var b1 = new Boat({boatName:'test orange'});
            b1.insert(function(record){
              done();
            });
          });
        });
      });

      describe('POST /boats', function(){
        it('should create a new boat', function(done){
          var oldname = __dirname + '/../fixtures/guitarBoat-copy.jpg';
          request(app)
          .post('/boats')
          .set('cookie', cookie)
          .field('boatName', 'Test Mer Mer')
          .field('year', '1997')
          .field('make', 'Hobie')
          .field('description', 'Really Fast, awesome boat')
          .field('ownerId', matt._id.toString())
          .field('type', 'sail')
          .attach('boatPhoto', oldname)
          .expect(302, done);
        });
        it('should not create a new boat, because duplicate boat Name', function(done){
          var oldname = __dirname + '/../fixtures/guitarBoat-copy2.jpg';
          request(app)
          .post('/boats')
          .set('cookie', cookie)
          .field('boatName', 'test orange')
          .field('year', '2000')
          .field('make', 'Sunfish')
          .field('description', 'Nice Boat')
          .field('ownerId', matt._id.toString())
          .field('type', 'sail')
          .attach('boatPhoto', oldname)
          .expect(302, done);
        });
      });
    });
  });
});

