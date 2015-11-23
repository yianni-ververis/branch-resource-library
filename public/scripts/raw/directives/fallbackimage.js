app.directive('fallbackImage', function() {
    var fallbackImage = {
        link: function postLink(scope, iElement, iAttrs) {
            iElement.on('error', function() {
                angular.element(this).attr("src", iAttrs.fallbackImage);
            });
        }
    }
    return fallbackImage;
})