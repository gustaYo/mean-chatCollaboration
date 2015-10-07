angular


    .module(AppName).directive("toggleClass", function() {
  return {
    restrict: "A",
    link: function(scope, element, attrs) {
      
      element.on("click", function() {
        element.toggleClass(attrs.toggleClass);
        scope.className = this.className;
      });
      
    }
  };
});