
onload = function() {
    var button = document.getElementById('main_button');
    var red_range = document.getElementById('red');
    var green_range = document.getElementById('green');
    var blue_range = document.getElementById('blue');

    var red = 0xA2;
    var green = 0x00;
    var blue = 0x00;

    document.getElementById('red').value = red;
    document.getElementById('green').value = green;
    document.getElementById('blue').value = blue;

    var on_click_button = function() {
        var color = getRandomColor()
        document.getElementById('background').style.backgroundColor = color;
        document.getElementById('color').innerHTML = color;
        document.getElementById('red').value = hexToRgb(color).r;
        document.getElementById('green').value = hexToRgb(color).g;
        document.getElementById('blue').value = hexToRgb(color).b;
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    var on_change_rgb = function() {
        var red = document.getElementById('red').value;
        var green = document.getElementById('green').value;
        var blue = document.getElementById('blue').value;
        var color = rgb2hex(red, green, blue);
        document.getElementById('background').style.backgroundColor = color;
        document.getElementById('color').innerHTML = color;
    }

    function rgb2hex(r,g,b) {
        return '#' + Number(r).toString(16).toUpperCase().replace(/^(.)$/,'0$1') + 
               Number(g).toString(16).toUpperCase().replace(/^(.)$/,'0$1') +
               Number(b).toString(16).toUpperCase().replace(/^(.)$/,'0$1');
    }

    function hexToRgb(hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    button.addEventListener('click', on_click_button, false);
    red_range.addEventListener('input', on_change_rgb, false);
    green_range.addEventListener('input', on_change_rgb, false);
    blue_range.addEventListener('input', on_change_rgb, false);
}