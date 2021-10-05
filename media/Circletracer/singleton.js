let singleton = (function() {
  let instance;

  function setter(json) {
    return {durCircleJson: json};
  };

  return {
    setInstance: function(json) {
      instance = setter(json);
    },
    getInstance: function() {
      if (!instance) {
        instance = foo(json);
      }
      return instance;
    }
  };
})();