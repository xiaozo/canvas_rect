(function(){
    if (process.env.NODE_ENV === 'production') {
        window.console=(function(origConsole){

            if(!window.console)
              console = {};
            var isDebug = false;
            return {
                log: function(){
                  isDebug && origConsole.log && origConsole.log.apply(origConsole,arguments);
                },
                warn: function(){
                  origConsole.warn && origConsole.warn.apply(origConsole,arguments);
                },
                error: function(){
                   origConsole.error && origConsole.error.apply(origConsole,arguments);
                },
                info: function(v){
                   origConsole.info && origConsole.info.apply(origConsole,arguments);
                },
                debug: function(bool){
                  isDebug = bool;
                },
            };
          
          }(window.console));
    }
  
})();