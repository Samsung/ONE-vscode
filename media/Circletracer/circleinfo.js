let circleInfo = (function() {
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
        instance = setter(json);
      }
      return instance;
    }
  };
})();
