(function(){

  'use strict';

  $(document).ready(initialize);


  function initialize(){
    //startCompass();
    startCompass2();
  }

  var gammaCounter = 0; //a way to reduce sensitivity of gamma calculations, less annoying;

  function startCompass2(){
    var needle = document.getElementById('needle');
    if(window.DeviceOrientationEvent){
      window.addEventListener('deviceorientation', function(event){
        var alpha;
        var webkitAlpha;
        var gamma = event.gamma;

      //ADJUST SENSITIVITY OF TILT BELOW
      
        if(gammaCounter > 10){
          $('#tilt').text(Math.round(gamma));
          gammaCounter = 0;
        }else{
          gammaCounter = gammaCounter + 1;
        }
        if(event.webkitCompassHeading){
          // for iOS
          
          alpha = event.webkitCompassHeading;
          needle.style.WebkitTransform = 'rotate(-' + alpha + 'deg)';

        }else{
          //for anything but iOS
          alpha = event.alpha;
          webkitAlpha = alpha;
          if(!window.chrome){
            //For Android Stock browser
            webkitAlpha = alpha - 270;
          }
        }
        needle.style.Transform = 'rotate(' + alpha + 'deg)';
        needle.style.WebkitTransform = 'rotate(' + webkitAlpha + 'deg)';

        //In firefox, reverse degree rotation
        needle.style.MozTransform = 'rotate(-' + alpha + 'deg)';
      }, false);
    }else{
      alert('Your device is not compatable');
    }
  }




/*
  function startCompass(){
    if(window.DeviceOrientationEvent){
      document.getElementById('doEvent').innerHTML = 'DeviceOrientation';

      window.addEventListener('deviceorientation', function(eventData){
        console.log('eventData');
        console.log(eventData);
        debugger;
        var tiltLR = eventData.gamma;
        // gamma is left-to-right tile in degrees

        var tiltFB = eventData.beta;
        //  beta is the front-to-back tilt in degrees

        var dir = eventData.alpha;
        // aplpha is the compass direction the device is facing in degrees

        deviceOrientationHandler(tiltLR, tiltFB, dir);
      }, false);
    }else{
      document.getElementById('doEvent').innerHTML = 'Not Supported';
    }
  }


  function deviceOrientationHandler(tiltLR, tiltFB, dir){
    document.getElementById('doTiltLR').innerHTML = Math.round(tiltLR);
    document.getElementById('doTiltFB').innerHTML = Math.round(tiltFB);
    document.getElementById('doDirection').innerHTML = Math.round(dir);


    var logo = document.getElementById('imgLogo');
    logo.style.webkitTransform = 'rotate('+ tiltLR +'deg) rotate3d(1,0,0, '+ (tiltFB*-1)+'deg)';
    logo.style.MozTransform = 'rotate('+ tiltLR + 'deg)';
    logo.style.transform = 'rotate('+ tiltLR +'deg) rotate3d(1,0,0, ' + (tiltFB*-1) +'deg)';
  }
*/
})();

