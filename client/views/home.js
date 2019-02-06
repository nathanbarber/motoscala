app.controller("home", function($scope) {
    $(document).ready(() => {
        var interval = animation();
    });
})

function animation() {
    var $canvas = $("#animation"),
        canvas = $canvas[0],
        cx = canvas.getContext('2d');

    // DPI SCALAGE
    canvas.width = w * 2;
    canvas.height = h * 2;
    canvas.style.width = w;
    canvas.style.height = h;
    cx.scale(2, 2);

    window.onresize = function() {
        // DPI SCALAGE
        canvas.width = w * 2;
        canvas.height = h * 2;
        canvas.style.width = w;
        canvas.style.height = h;
        cx.scale(2, 2);
    }
    
    return setInterval(() => {
        
    }, 10)
}