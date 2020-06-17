/** 
** 得到浏览器每秒帧数fps 
**  
** @Date Mar 13 2013 
**/ 
var showFPS = (function(){ 
  var requestAnimationFrame =  
      window.requestAnimationFrame || //Chromium  
      window.webkitRequestAnimationFrame || //Webkit 
      window.mozRequestAnimationFrame || //Mozilla Geko 
      window.oRequestAnimationFrame || //Opera Presto 
      window.msRequestAnimationFrame || //IE Trident? 
      function(callback) { //Fallback function 
        window.setTimeout(callback, 1000/60); 
      };
  var frameRateElm = document.getElementById('frameRate')
  var e,offset; 

  var fps = 0; 
  var last = Date.now(); 
  var step = function(){ 
      offset = Date.now() - last; 
      fps += 1; 
      if( offset >= 1000 ){ 
        last += offset; 
        appendFps(fps); 
        fps = 0; 
      } 
      requestAnimationFrame( step ); 
  }; 
  var appendFps = function(fps){ 
      if(!e) e=document.createElement('span');
      e.innerHTML = "fps: " + fps; 
      frameRateElm.appendChild(e);
  } 
  return {
    go:  function(){step();} 
  } 
})();
showFPS.go()