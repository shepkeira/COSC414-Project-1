var vertexShaderTextDisk = [
    'attribute vec2 vPosition;',
    
    'void main()',
    '{',
    '   vec2 position;',
    '   position.x = vPosition.x;',
    '   position.y = vPosition.y;',
    '   gl_Position.x = position.x;',
    '   gl_Position.y = position.y;',
    '   gl_Position.z = 0.0;',
    '   gl_Position.w = 1.0;',
    '}'
    ].join('\n');
    
var fragmentShaderTextDisk = [
    'precision mediump float;',
    'void main()',
    '{',
        
    '	gl_FragColor = vec4(1,1,1,1);',
    '}',
    ].join('\n')


var vertexShaderTextBacteria = [
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
    
var fragmentShaderTextBacteria = [
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

class Disk{
    constructor(currentScale_disk, centerOfDisk_real)
}

function shaders(gl, program, vertShader, fragShader) {
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader,vertShader);
    gl.shaderSource(fragmentShader,fragShader);

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

// function get_circle_verticies(centerOfCircle, radiusOfCircle, gl) {
//     // console.log(radiusOfCircle);
//     var verticesData = [];
//     verticesData.push(centerOfCircle[0]);
//     verticesData.push(centerOfCircle[1]);

//     for(var i = 0; i <= noOfFans; i++) {
//         var angle = anglePerFan * i;
//         var xCoordinate = centerOfCircle[0] + Math.cos(angle) * radiusOfCircle[0];
//         var yCoordinate = centerOfCircle[1] + Math.sin(angle) * radiusOfCircle[1];
//         var point = new Float32Array(2);
//         point[0] = xCoordinate;
//         point[1] = yCoordinate;
//         verticesData.push(xCoordinate);
//         verticesData.push(yCoordinate);
//     }

//     verticesData = verticesData.flat();
//     console.log("verticies_data");
//     console.log(verticesData);

//     var circleVertexBufferObject = gl.createBuffer();
//     //set the active buffer to the triangle buffer
//     gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBufferObject);
//     //gl expecting Float32 Array not Float64
//     //gl.STATIC_DRAW means we send the data only once (the triangle vertex position
//     //will not change over time)
//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesData), gl.STATIC_DRAW);
//     return verticesData;
// };

function disk_generator(currentScale_disk, centerOfDisk_real, canvas, gl) {
    
    var centerOfDisk = new Float32Array(2);
    centerOfDisk = [0, 0]; //x, y
    var radiusOfDisk = new Float32Array(2);
    var desired_y_radius = canvas.height*(3/4);
    var desired_x_radius = canvas.width*(3/4);
    var desired_radius = Math.min(desired_y_radius, desired_x_radius);
    radiusOfDisk = [desired_radius/canvas.width, desired_radius/canvas.height] // scale from actual value to [-1, 1]
    var verticesDataOfDisk = [];
    verticesDataOfDisk.push(centerOfDisk[0]);
    verticesDataOfDisk.push(centerOfDisk[1]);

    for(var i = 0; i <= noOfFans; i++) {
        var angle = anglePerFan * i;
        var xCoordinate_disk = centerOfDisk[0] + Math.cos(angle) * radiusOfDisk[0];
        var yCoordinate_disk = centerOfDisk[1] + Math.sin(angle) * radiusOfDisk[1];
        // var point = new Float32Array(2);
        // point[0] = xCoordinate_disk;
        // point[1] = yCoordinate_disk;
        verticesDataOfDisk.push(xCoordinate_disk);
        verticesDataOfDisk.push(yCoordinate_disk);
    }

    verticesDataOfDisk = JSON.parse(JSON.stringify(verticesDataOfDisk.flat()));

    var diskVertexBufferObject = gl.createBuffer();
    //set the active buffer to the triangle buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, diskVertexBufferObject);
    //gl expecting Float32 Array not Float64
    //gl.STATIC_DRAW means we send the data only once (the triangle vertex position
    //will not change over time)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesDataOfDisk), gl.STATIC_DRAW);

    var disk = {};
    disk['scale'] = currentScale_disk;
    disk['center'] = centerOfDisk_real;
    disk['radius'] = radiusOfDisk;
    disk['vertices'] =  JSON.parse(JSON.stringify(verticesDataOfDisk));
    disk['colour'] = [1,1,1,1];
    return disk;
};

function bacteria_generator(bacteria_currentScale, bact_canvas, bact_gl, bacteria_program) {
    number_of_possible_colours = bacteria_colours.length
    random_colour = Math.floor((Math.random()*number_of_possible_colours) + 0); //0 to length
    var bact_colour = bacteria_colours[random_colour];//[1, 1, 1, 1]; //bacteria_colours

    y_center_bact = Math.floor((Math.random()*bact_canvas.height) + 0)/bact_canvas.height; //0 to length
    x_center_bact = Math.floor((Math.random()*bact_canvas.width) + 0)/bact_canvas.width; //0 to length
    circle_center_bact = [y_center_bact, x_center_bact];
    var centerOfCircle_bact = new Float32Array(2);
    centerOfCircle_bact = [0, 0]; //x, y
    var radiusOfCircle_bact = new Float32Array(2);
    var desired_radius_bact = 50;
    radiusOfCircle_bact = [desired_radius_bact/bact_canvas.width, desired_radius_bact/bact_canvas.height] // scale from actual value to [-1, 1]
    var verticesData_bact = [];
    verticesData_bact.push(centerOfCircle_bact[0]);
    verticesData_bact.push(centerOfCircle_bact[1]);

    for(var i = 0; i <= noOfFans; i++) {
        var angle = anglePerFan * i;
        var xCoordinate = centerOfCircle_bact[0] + Math.cos(angle) * radiusOfCircle_bact[0];
        var yCoordinate = centerOfCircle_bact[1] + Math.sin(angle) * radiusOfCircle_bact[1];
        var point = new Float32Array(2);
        point[0] = xCoordinate;
        point[1] = yCoordinate;
        verticesData_bact.push(xCoordinate);
        verticesData_bact.push(yCoordinate);
    }

    verticesData_bact = verticesData_bact.flat();

    var circleVertexBufferObject_bact = bact_gl.createBuffer();
    if (!circleVertexBufferObject_bact) {
        console.error("Failed to create buffer");
        return -1;
    }
    //set the active buffer to the triangle buffer
    bact_gl.bindBuffer(bact_gl.ARRAY_BUFFER, circleVertexBufferObject_bact);
    //gl expecting Float32 Array not Float64
    //gl.STATIC_DRAW means we send the data only once (the triangle vertex position
    //will not change over time)
    bact_gl.bufferData(bact_gl.ARRAY_BUFFER, new Float32Array(verticesData_bact), bact_gl.STATIC_DRAW);

    var positionAttribLocation = bact_gl.getAttribLocation(bacteria_program,'vPosition');
    bact_gl.vertexAttribPointer(
        positionAttribLocation, //attribute location
        2, //number of elements per attribute
        bact_gl.FLOAT, 
        bact_gl.FALSE,
        2*Float32Array.BYTES_PER_ELEMENT,//size of an individual vertex
        0*Float32Array.BYTES_PER_ELEMENT//offset from the beginning of a single vertex to this attribute
        );
    bact_gl.enableVertexAttribArray(positionAttribLocation);

    var bact_circle = {};
    bact_circle['scale'] = bacteria_currentScale;
    bact_circle['center'] = circle_center_bact;
    bact_circle['radius'] = radiusOfCircle_bact;
    bact_circle['vertices'] =  verticesData_bact;
    bact_circle['colour'] = bact_colour;
    
    return bact_circle;
}
    
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
    var bacteria_program = gl.createProgram();
    var gl_shaders = shaders(gl, bacteria_program, vertexShaderTextBacteria, fragmentShaderTextBacteria)

    gl.linkProgram(bacteria_program);
    if(!gl.getProgramParameter(bacteria_program,gl.LINK_STATUS)){
        console.error('Error linking program!', gl.getProgramInfo(bacteria_program));
        return;
    }

    var disk_program = gl.createProgram();
    var gl_shaders = shaders(gl, disk_program, vertexShaderTextDisk, fragmentShaderTextDisk)

    gl.linkProgram(disk_program);
    if(!gl.getProgramParameter(disk_program,gl.LINK_STATUS)){
        console.error('Error linking program!', gl.getProgramInfo(disk_program));
        return;
    }

    //////////////////////////////////
    //    create circle buffer    //
    //////////////////////////////////
    var xScale = 1.0, yScale = 1.0;
    var currentScale = [xScale, yScale];
    var circles = [];

    // var desired_y_radius = canvas.height*(3/4);
    // var desired_x_radius = canvas.width*(3/4);
    // var disk_radius = Math.min(desired_y_radius, desired_x_radius);
    
    
    for(var i = 0; i < 2; i++) {
        circle = bacteria_generator(currentScale, canvas, gl, bacteria_program);
        circles.push(circle);
    }
    //debugger;
    disk = disk_generator([1,1], [0, 0], canvas, gl)

    console.log(circles);
    console.log(disk);
    
    /////////////////////////////////
    //            Drawing           //
    //////////////////////////////////
    var previousTime = 0;
    var scaleGrowthPerSecond = 0.125;

    animateScene();
    function animateScene() { 
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        var positionAttribLocation = gl.getAttribLocation(disk_program,'vPosition');
        gl.vertexAttribPointer(
            positionAttribLocation, //attribute location
            2, //number of elements per attribute
            gl.FLOAT, 
            gl.FALSE,
            2*Float32Array.BYTES_PER_ELEMENT,//size of an individual vertex
            0*Float32Array.BYTES_PER_ELEMENT//offset from the beginning of a single vertex to this attribute
            );
        gl.enableVertexAttribArray(positionAttribLocation);

        gl.useProgram(disk_program);

        //// DRAW DISK
        var verticesData = disk['vertices'];
        points = verticesData.length/2;
        gl.drawArrays(gl.TRIANGLE_FAN,0,points);
        ////

        for(var i = 0; i < circles.length; i++) {
            gl.useProgram(bacteria_program);
            
            var currentCircle = circles[i];
            uScalingFactor = gl.getUniformLocation(bacteria_program, "uScalingFactor");
            gl.uniform2f(uScalingFactor, currentCircle['scale'][0], currentCircle['scale'][1]);
        
            uCenter = gl.getUniformLocation(bacteria_program, "uCenter");
            gl.uniform2f(uCenter, currentCircle['center'][0], currentCircle['center'][1]);

            uColour = gl.getUniformLocation(bacteria_program, "vertColor");
            gl.uniform4f(uColour, currentCircle['colour'][0], currentCircle['colour'][1], currentCircle['colour'][2], currentCircle['colour'][3]);
            
            var verticesData = currentCircle['vertices'];
            points = verticesData.length/2;
            gl.drawArrays(gl.TRIANGLE_FAN,0,points);
        }

        window.requestAnimationFrame(function(currentTime) {
            var deltaScale = ((currentTime - previousTime) / 1000) * scaleGrowthPerSecond;
            for(var i = 0; i < circles.length; i++) {
                var currentCircle = circles[i];
                currentCircle['scale'][0] += deltaScale;
                currentCircle['scale'][1] += deltaScale;
            }
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