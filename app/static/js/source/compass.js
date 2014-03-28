(function(){

  'use strict';

  $(document).ready(initialize);


  function initialize(){
    startCompass();
  }

  function startCompass(){
    if(window.DeviceOrientationEvent){
      document.getElementById('doEvent').innerHTML = 'DeviceOrientation';

      window.addEventListener('deviceorientation', function(eventData){
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

})();

