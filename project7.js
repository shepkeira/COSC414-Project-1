var vertexShaderText = [
    'attribute vec2 vPosition;',
    'uniform vec2 uScalingFactor;',
    'uniform vec2 uCenter;',

    'attribute vec4 vertColor;',
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

var noOfFans = 80; // number of fans in the triangle fan to make circles
var anglePerFan = (2*Math.PI) / noOfFans; // angle of each triangle to make the fans
var bacteria_colours = [
    [      0, 168/255, 107/255, 1.0],
    [128/255, 128/255,   0/255, 1.0],
    [  0/255, 255/255,   0/255, 1.0],
    [  0/255, 255/255, 127/255, 1.0],
    [  0/255, 128/255,   0/255, 1.0],
];

function shaders(gl, program) {
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

    return [vertexShader, fragmentShader];
};

function get_circle_verticies(centerOfCircle, radiusOfCircle, colour, gl) {
    var verticesData = []
    verticesData.push(centerOfCircle[0]);
    verticesData.push(centerOfCircle[1]);
    verticesData.push(colour[0]);
    verticesData.push(colour[1]);
    verticesData.push(colour[2]);
    verticesData.push(colour[3]);

    for(var i = 0; i <= noOfFans; i++) {
        var angle = anglePerFan * i;
        var xCoordinate = centerOfCircle[0] + Math.cos(angle) * radiusOfCircle[0];
        var yCoordinate = centerOfCircle[1] + Math.sin(angle) * radiusOfCircle[1];
        var point = new Float32Array(2);
        point[0] = xCoordinate;
        point[1] = yCoordinate;
        verticesData.push(xCoordinate);
        verticesData.push(yCoordinate);
        verticesData.push(colour[0]);
        verticesData.push(colour[1]);
        verticesData.push(colour[2]);
        verticesData.push(colour[3]);
    }

    verticesData = verticesData.flat();

    var circleVertexBufferObject = gl.createBuffer();
    //set the active buffer to the triangle buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBufferObject);
    //gl expecting Float32 Array not Float64
    //gl.STATIC_DRAW means we send the data only once (the triangle vertex position
    //will not change over time)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesData), gl.STATIC_DRAW);

    return verticesData;
};

function circle_generator(currentScale, centerOfCircle_real, colour, canvas, gl) {
    var centerOfCircle = new Float32Array(2);
    centerOfCircle = [0, 0]; //x, y
    var radiusOfCircle = new Float32Array(2);
    var desired_radius = 50; // width and height aren't equal so we take the smaller to fit on the screen
    radiusOfCircle = [desired_radius/canvas.width, desired_radius/canvas.height] // scale from actual value to [-1, 1]

    var verticesData = get_circle_verticies(centerOfCircle, radiusOfCircle, colour, gl);

    var circle = {};
    circle['scale'] = currentScale;
    circle['center'] = centerOfCircle_real;
    circle['radius'] = radiusOfCircle;
    circle['vertices'] = verticesData;
    circle['colour'] = colour;
    return circle;
};
    
var InitDemo = function() {


    //////////////////////////////////
    //       initialize WebGL       //
    //////////////////////////////////
    console.log('this is working');

    var canvas = document.getElementById('game-surface');
    var gl = canvas.getContext('webgl');

    if (!gl){
        console.log('webgl not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl){
        alert('your browser does not support webgl');
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0,0,canvas.width,canvas.height);

    

    //////////////////////////////////
    // create/compile/link shaders  //
    //////////////////////////////////
    var program = gl.createProgram();
    var gl_shaders = shaders(gl, program);

    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
        console.error('Error linking program!', gl.getProgramInfo(program));
        return;
    }

    //////////////////////////////////
    //    create circle buffer    //
    //////////////////////////////////
    var xScale = 1.0, yScale = 1.0;
    var currentScale = [xScale, yScale];
    var circles = [];
    number_of_possible_colours = bacteria_colours.length
    random_colour = Math.floor((Math.random()*number_of_possible_colours) + 0); //0 to length
    var colour = bacteria_colours[random_colour];//[1, 1, 1, 1]; //bacteria_colours

    circle_center = [0.25, 0.5];
    circle = circle_generator(currentScale, circle_center, colour, canvas, gl)
    circles.push(circle);
    //////////////////////////////////
    //            Drawing           //
    //////////////////////////////////
    var previousTime = 0;
    var scaleGrowthPerSecond = 0.5;
    animateScene();
    function animateScene() { 
        currentScale = [xScale, yScale];
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    
       
        var positionAttribLocation = gl.getAttribLocation(program,'vPosition');
        gl.vertexAttribPointer(
            positionAttribLocation, //attribute location
            2, //number of elements per attribute
            gl.FLOAT, 
            gl.FALSE,
            6*Float32Array.BYTES_PER_ELEMENT,//size of an individual vertex
            0*Float32Array.BYTES_PER_ELEMENT//offset from the beginning of a single vertex to this attribute
            );
        
        var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
        gl.vertexAttribPointer(
            colorAttribLocation,
            4,
            gl.FLOAT,
            gl.FALSE,
            6*Float32Array.BYTES_PER_ELEMENT,
            2*Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(positionAttribLocation);
        gl.enableVertexAttribArray(colorAttribLocation);

        gl.useProgram(program);
        
        uScalingFactor = gl.getUniformLocation(program, "uScalingFactor");
        gl.uniform2f(uScalingFactor, currentScale[0], currentScale[1]);
    
        uCenter = gl.getUniformLocation(program, "uCenter");
        gl.uniform2f(uCenter, circle['center'][0], circle['center'][1]);


        for(var i = 0; i < circles.length; i++) {
            var currentCircle = circles[i];
            var verticesData = currentCircle['vertices'];
            points = verticesData.length/6;
            gl.drawArrays(gl.TRIANGLE_FAN,0,points);
        }

        if(gl.getError() != 0){
            error = gl.getError();
            console.log(error);
            return;
        }

        window.requestAnimationFrame(function(currentTime) {
            var deltaScale = ((currentTime - previousTime) / 1000) * scaleGrowthPerSecond;
            xScale = xScale + deltaScale;
            yScale = yScale + deltaScale;
            previousTime = currentTime;
            animateScene();
        })
    };

    canvas.onmousedown = function(ev) {
        var mx = ev.clientX, my = ev.clientY;
        mx = mx/canvas.width - 0.5;
        my = my/canvas.height - 0.5;
        mx = mx*2;
        my = my*-2;
        
        var radius = circles[0]['radius'];
        var center = circles[0]['center'];

        var radius_of_circle_x = radius[0] * currentScale[0]
        var radius_of_circle_y = radius[1] * currentScale[1]
        var xCenterOfCircle = center[0];
        var yCenterOfCircle = center[1];

        if (mx > (radius_of_circle_x + xCenterOfCircle) || mx < -(radius_of_circle_x + xCenterOfCircle)) {
            in_circle = false;
        } else if (my > (radius_of_circle_y + yCenterOfCircle) || my < -(radius_of_circle_y + yCenterOfCircle)) {
            in_circle = false;
        } else {
            in_circle = true;
        }

        if (in_circle) {
            scaleGrowthPerSecond = scaleGrowthPerSecond+1;
        }
    }
};