const resizeHelper = () => {
   const callbacks = [];
   let running = false;

   // fired on resize event
   const resize = () => {
      if (!running) {
         running = true;

         if (window.requestAnimationFrame) {
            window.requestAnimationFrame(runCallbacks);
         } else {
            setTimeout(() => runCallbacks(), 66);
         }
      }
   };

   // run the actual callbacks
   const runCallbacks = () => {
      callbacks.forEach(function(callback) {
         callback();
      });

      running = false;
   };

   // adds callback to loop
   const addCallback = callback => {
      if (callback) {
         callbacks.push(callback);
      }
   };

   return {
      // public method to add additional callback
      add: callback => {
         if (!callbacks.length) {
            window.addEventListener("resize", resize);
         }
         addCallback(callback);
      }
   };
};

const resize = resizeHelper();
export default resize;
