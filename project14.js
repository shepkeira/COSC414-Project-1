//////////////////////////////////
//          Shader Code         //
//////////////////////////////////
var vertexShaderText = [
    'attribute vec2 vPosition;',
    'uniform vec2 uScalingFactor;',
    'uniform vec2 uCenter;',

    'uniform vec4 vertColor;',
    'varying vec4 fragColor;',
    
    'void main()',
    '{',
    '   vec2 position;',
    '   position.x = vPosition.x * uScalingFactor.x;',
    '   position.y = vPosition.y * uScalingFactor.y;',
    '   gl_Position.x = position.x + uCenter.x;',
    '   gl_Position.y = position.y + uCenter.y;',
    '   gl_Position.z = 0.0;',
    '   gl_Position.w = 1.0;',
    '   fragColor = vertColor;',
    '}'
].join('\n');
    
var fragmentShaderText = [
    'precision mediump float;',

    'varying vec4 fragColor;',

    'void main()',
    '{',
        
    '	gl_FragColor = fragColor;',
    '}',
].join('\n')

//////////////////////////////////
//       Global Variables       //
//////////////////////////////////

var GameOver = false;
var Won = null;

var scaleGrowthPerSecond = 0.0125;

var noOfFans = 80; // number of fans in the triangle fan to make circles
var anglePerFan = (2*Math.PI) / noOfFans; // angle of each triangle to make the fans
var bacteria_count = 0;
var bacteria_colours = [
    [      0, 168/255, 107/255, 1.0],
    [128/255, 128/255,   0/255, 1.0],
    [  0/255, 255/255,   0/255, 1.0],
    [  0/255, 255/255, 127/255, 1.0],
    [  0/255, 128/255,   0/255, 1.0],
    [ 72/255,  61/255, 139/255, 1.0],
    [123/255, 104/255, 238/255, 1.0],
    [138/255,  43/255, 226/255, 1.0],
    [75/255,    0/255, 130/255, 1.0],
    [135/255, 206/255, 250/255, 1.0],
    [176/255, 224/255, 230/255, 1.0],
    [ 95/255, 158/255, 160/255, 1.0],
    [100/255, 149/255, 237/255, 1.0],
    [188/255, 143/255, 143/255, 1.0],
    [205/255, 133/255,  63/255, 1.0],
    [165/255,  42/255,  42/255, 1.0],
    [128/255,   0/255,   0/255, 1.0]
];

//////////////////////////////////
//        Circle Class          //
//////////////////////////////////
class Circle{
    constructor(currentScale, centerOfCircle_real, colour, canvas, gl) {
        this.scale = currentScale;
        this.center = centerOfCircle_real;
        this.canvas_width = canvas.width;
        this.canvas_height = canvas.height;
        this.radius = this.radiusOfCircle();
        this.vertices = this.verticesData();
        this.colour = colour;
        this.deleted = false;
    }

    is_deleted() {
        return this.deleted;
    }

    disk() {
        return {
            "scale": this.scale,
            "center": this.center,
            "radius": this.radius,
            "vertices": this.vertices,
            "colour": this.colour,
            "deleted": this.deleted
        }
    }

    delete_circle() {
        this.deleted = true;
    }

    radiusOfCircle() {
        var radius = new Float32Array(2);
        var desired_radius;
        desired_radius = 500;
        radius = [desired_radius/this.canvas_width, desired_radius/this.canvas_height] // scale from actual value to [-1, 1]
        return radius
    }

    verticesData() {
        var centerOfCircle = [0, 0];
        var verticesData = [];
        verticesData.push(centerOfCircle[0]);
        verticesData.push(centerOfCircle[1]);

        for(var i = 0; i <= noOfFans; i++) {
            var angle = anglePerFan * i;
            var xCoordinate = centerOfCircle[0] + Math.cos(angle) * this.radius[0];
            var yCoordinate = centerOfCircle[1] + Math.sin(angle) * this.radius[1];
            var point = new Float32Array(2);
            point[0] = xCoordinate;
            point[1] = yCoordinate;
            verticesData.push(xCoordinate);
            verticesData.push(yCoordinate);
        }

        verticesData = verticesData.flat();

        return verticesData;
    }

    cirbleBindBuffers(gl) {
        var circleVertexBufferObject = gl.createBuffer();
        //set the active buffer to the triangle buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBufferObject);
        //gl expecting Float32 Array not Float64
        //gl.STATIC_DRAW means we send the data only once (the triangle vertex position
        //will not change over time)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    }
}
//////////////////////////////////
//       Shader Function        //
//////////////////////////////////

function shaders(gl) {
    var program = gl.createProgram();

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader,vertexShaderText);
    gl.shaderSource(fragmentShader,fragmentShaderText);

    gl.compileShader(vertexShader);
    if(!gl.getShaderParameter(vertexShader,gl.COMPILE_STATUS)){
        console.error('Error compiling vertex shader!', gl.getShaderInfoLog(vertexShader))
        return;
    }
    gl.compileShader(fragmentShader);
        if(!gl.getShaderParameter(fragmentShader,gl.COMPILE_STATUS)){
        console.error('Error compiling vertex shader!', gl.getShaderInfoLog(fragmentShader))
        return;
    }

    gl.attachShader(program,vertexShader);
    gl.attachShader(program,fragmentShader);

    return program;
};

//////////////////////////////////
//      Bacteria Generator      //
//////////////////////////////////

function bacteria_generator(currentScale, canvas, gl, disk_radius) {
    number_of_possible_colours = bacteria_colours.length
    var colour = bacteria_colours[bacteria_count];
    bacteria_count += 1;
    random_angle = Math.floor((Math.random() * 360) + 0);
    y_center = disk_radius[0]*Math.cos(random_angle);
    x_center = disk_radius[1]*Math.sin(random_angle);
    circle_center = [y_center, x_center];
    circle_obj = new Circle(currentScale, circle_center, colour, canvas, gl);
    circle = circle_obj.disk();
    circle_obj.cirbleBindBuffers(gl);
    return circle;
}

//////////////////////////////////
//       Bacteria Overlap       //
//////////////////////////////////

function bacteria_overloap(firstBacteria, secondBacteria) {
    var line_between_centers = [
        secondBacteria['center'][0] - firstBacteria['center'][0],
        secondBacteria['center'][1] - firstBacteria['center'][1]
    ];
    var magnitude_of_line = Math.sqrt(Math.pow(line_between_centers[0], 2), Math.pow(line_between_centers[0], 2));
    //first ignore cases where the centers are further apart then their furthest points
    if(magnitude_of_line > (
            Math.max(firstBacteria['radius'][0]*firstBacteria['scale'][0], firstBacteria['radius'][0]*firstBacteria['scale'][0]) +
            Math.max(secondBacteria['radius'][0]*secondBacteria['scale'][0], secondBacteria['radius'][0]*secondBacteria['scale'][0])
    )) {
        return false;
    }
    var angle_from_point_fist_to_second = Math.abs(Math.atan(line_between_centers[0], line_between_centers[1]));
    var angle_from_point_second_to_first = 90 - angle_from_point_fist_to_second;
    if(
        (line_between_centers[0] <= firstBacteria['center'][0]-(firstBacteria['radius'][0]*firstBacteria['scale'][0])) | 
        (line_between_centers[0] >= firstBacteria['center'][0]+(firstBacteria['radius'][0]*firstBacteria['scale'][0]))
        ) 
    {
        var firstBacteria_radius_in_direction_of_secondBacteria = Math.abs(line_between_centers[0]/Math.cos(angle_from_point_fist_to_second));
        if(!(firstBacteria_radius_in_direction_of_secondBacteria <=  Math.max(firstBacteria['radius'][0]*firstBacteria['scale'][0], firstBacteria['radius'][1]*firstBacteria['scale'][1]))) 
        {
            return false;
        }
        var secondBacteria_radius_in_direction_of_second_Bacteria = Math.abs(line_between_centers[0]/Math.sin(angle_from_point_second_to_first));
        if(!(secondBacteria_radius_in_direction_of_second_Bacteria <= Math.max(secondBacteria['radius'][0]*secondBacteria['scale'][0], secondBacteria['radius'][1]*secondBacteria['scale'][1]))) 
        {
            return false;
        }
        console.log('bacteria_collided');
        return true;
    } else 
    {
        var firstBacteria_radius_in_direction_of_secondBacteria =  Math.abs(line_between_centers[1]/Math.sin(angle_from_point_fist_to_second));
        if(!(firstBacteria_radius_in_direction_of_secondBacteria <= Math.max(firstBacteria['radius'][0]*firstBacteria['scale'][0], firstBacteria['radius'][1]*firstBacteria['scale'][1])))
        {
            return false;
        }
        var secondBacteria_radius_in_direction_of_second_Bacteria = Math.abs(line_between_centers[1]/Math.cos(angle_from_point_second_to_first));
        if(!(secondBacteria_radius_in_direction_of_second_Bacteria <= Math.max(secondBacteria['radius'][0]*secondBacteria['scale'][0], secondBacteria['radius'][1]*secondBacteria['scale'][1])))  
        {
            return false;
        }
        console.log('bacteria_collided');
        return true;
    }
}
//////////////////////////////////
//         Main Function       //
//////////////////////////////////

var InitDemo = function() {


    //////////////////////////////////
    //       initialize WebGL       //
    //////////////////////////////////
    console.log('this is working');

    var canvas = document.getElementById('game-surface');
    var gl = canvas.getContext('webgl');
    var gameOverText = document.getElementById('gameover')

    if (!gl){
        console.log('webgl not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl){
        alert('your browser does not support webgl');
    }

    canvas_size = Math.min(window.innerHeight, window.innerWidth) - 50;
    canvas.width = canvas_size;//window.innerWidth;
    canvas.height = canvas_size;//window.innerHeight;
    gl.viewport(0,0,canvas.width,canvas.height);

    //////////////////////////////////
    // create/compile/link shaders  //
    //////////////////////////////////

    var program = shaders(gl);

    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
        console.error('Error linking program!', gl.getProgramInfo(program));
        return;
    }

    //////////////////////////////////
    //    create circle buffer      //
    //////////////////////////////////
    var currentScale = [0.1, 0.1];
    var circles = [];
    
    disk_obj = new Circle([1,1], [0,0], [1,1,1,1], canvas, gl);
    disk = disk_obj.disk();
    disk_obj.cirbleBindBuffers(gl);
    for(var i = 0; i < 10; i++) {
        circle = bacteria_generator(currentScale, canvas, gl, disk["radius"]);
        circles.push(circle);
    }
    
    /////////////////////////////////
    //            Drawing           //
    //////////////////////////////////
    var previousTime = 0;

    animateScene();
    function animateScene() { 
        // Clear Screen
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Enable Vertex Attribute
        var positionAttribLocation = gl.getAttribLocation(program,'vPosition');
        gl.vertexAttribPointer(
            positionAttribLocation, //attribute location
            2, //number of elements per attribute
            gl.FLOAT, 
            gl.FALSE,
            2*Float32Array.BYTES_PER_ELEMENT,//size of an individual vertex
            0*Float32Array.BYTES_PER_ELEMENT//offset from the beginning of a single vertex to this attribute
            );
        gl.enableVertexAttribArray(positionAttribLocation);

        gl.useProgram(program);

        // DRAW DISK
        uScalingFactor = gl.getUniformLocation(program, "uScalingFactor");
        gl.uniform2f(uScalingFactor, disk['scale'][0], disk['scale'][1]);

        uCenter = gl.getUniformLocation(program, "uCenter");
        gl.uniform2f(uCenter, disk['center'][0], disk['center'][1]);

        uColour = gl.getUniformLocation(program, "vertColor");
        gl.uniform4f(uColour, disk['colour'][0], disk['colour'][1], disk['colour'][2], disk['colour'][3]);
        
        var verticesData = disk['vertices'];
        points = verticesData.length/2;
        gl.drawArrays(gl.TRIANGLE_FAN,0,points);

        //if collide first second disappears

        // DRAW BACTERIA
        for(var i = 0; i < circles.length; i++) {
            
            var currentCircle = circles[i];
            if (!currentCircle['deleted']) {
                uScalingFactor = gl.getUniformLocation(program, "uScalingFactor");
                gl.uniform2f(uScalingFactor, currentCircle['scale'][0], currentCircle['scale'][1]);
            
                uCenter = gl.getUniformLocation(program, "uCenter");
                gl.uniform2f(uCenter, currentCircle['center'][0], currentCircle['center'][1]);

                uColour = gl.getUniformLocation(program, "vertColor");
                gl.uniform4f(uColour, currentCircle['colour'][0], currentCircle['colour'][1], currentCircle['colour'][2], currentCircle['colour'][3]);
                
                var verticesData = currentCircle['vertices'];
                points = verticesData.length/2;
                gl.drawArrays(gl.TRIANGLE_FAN,0,points);
            }
        }

        //check if 2 bacteria collide
        for(var i = circles.length-1; i >= 0; i--) {
            var firstBacteria = circles[i];
            if (!firstBacteria['deleted']) {
                for(var j = i-1; j >= 0; j--) {
                    var secondBacteria = circles[j];
                    if (!secondBacteria['deleted']) {
                        //firstBacteria and secondBacteria
                        overlap = bacteria_overloap(firstBacteria, secondBacteria);
                        if (overlap) {
                            secondBacteria['deleted'] = true;
                        }
                    }

                }
            }
        }

        //CHECK IF GAME OVER
        //CHECK IF PLAYER HAS WON
        all_bateria_gone = true;
        for(var i = 0; i < circles.length; i++) {
            var currentCircle = circles[i];
            if (!currentCircle['deleted']) {
                all_bateria_gone = false;
            }
        }
        if (all_bateria_gone) {
            GameOver = true;
            Won = true;
        }

        //CHECK IF GAME HAS WON
        num_bacteria_meeting_size_limit = 0;
        for(var i = 0; i < circles.length; i++) {
            var currentCircle = circles[i];
            if (currentCircle['scale'][0] > .3 | currentCircle['scale'][1] > .3 ) {
                num_bacteria_meeting_size_limit += 1;
            }
        }
        if (num_bacteria_meeting_size_limit >= 2) {
            GameOver = true;
            Won = false;
        }


        if(!GameOver) {
            window.requestAnimationFrame(function(currentTime) {
                // Update Scale of Bacteria if game not over
                var deltaScale = ((currentTime - previousTime) / 1000) * scaleGrowthPerSecond;
                currentScale[0] += deltaScale;
                currentScale[1] += deltaScale;
                previousTime = currentTime;
                // If game not over keep updating animation
                animateScene();
            })
        } else {
            // If game over display who won and stop updating animation
            if (Won) {
                gameOverText.innerHTML = "You Win!";
            } else {
                gameOverText.innerHTML = "You Lost!";
            }
            console.log("Game Over"); //note in console log that game has ended
        }
    };

    // Check if point (a,b) is in circle at (x,y) with radius (rx, ry) and at scale (sx,sy)
    function point_in_circle(a, b, x, y, rx, ry, sx, sy) {
        var radius_x = rx*sx;
        var radius_y = ry*sy;

        var p = ((Math.pow((a-x), 2) / Math.pow(radius_x,2))
                    + (Math.pow((b-y), 2) / Math.pow(radius_y,2)));

        if(p <= 1) {
            return true;
        }
        return false;
    }

    // When mouse clicked check if you are clicking on circle
    canvas.onmousedown = function(ev) {
        var mx = ev.clientX, my = ev.clientY;
        mx = mx/canvas.width -0.5;
        my = my/canvas.height -0.5;
        mx = mx*2;
        my = my*-2;

        // Check bacteria from top to bottom (reverse order from how they are displayed on screen)
        // So that the bateria on top will deleted not the one on the bottom
        for(var i = circles.length - 1; i >= 0; i--) {
            if(circles[i]['deleted']) {
                // check only bacteria that are still in play
                continue;
            }
            var radius = circles[i]['radius'];
            var center = circles[i]['center'];
            var scale = circles[i]['scale'];

            var in_circle = point_in_circle(mx, my, center[0], center[1], radius[0], radius[1], scale[0], scale[1]);
            // Delete only the first bacteria clicked on
            if (in_circle) {
                circles[i]['deleted'] = true;
                break;
            }
        }
    }
};