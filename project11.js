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

class Circle{
    constructor(currentScale, centerOfCircle_real, colour, canvas, gl) {
        this.scale = currentScale;
        this.center = centerOfCircle_real;
        this.canvas_width = canvas.width;
        this.canvas_height = canvas.height;
        this.radius = this.radiusOfCircle();
        this.vertices = this.verticesData();
        this.colour = colour;
    }

    disk() {
        return {
            "scale": this.scale,
            "center": this.center,
            "radius": this.radius,
            "vertices": this.vertices,
            "colour": this.colour
        }
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

function bacteria_generator(currentScale, canvas, gl, disk_radius) {
    number_of_possible_colours = bacteria_colours.length
    random_colour = Math.floor((Math.random()*number_of_possible_colours) + 0); //0 to length
    var colour = bacteria_colours[random_colour];//[1, 1, 1, 1]; //bacteria_colours

    // y_center = Math.floor((Math.random()*canvas.height) + 0)/canvas.height; //0 to length
    // x_center = Math.floor((Math.random()*canvas.width) + 0)/canvas.width; //0 to length
    random_angle = Math.floor((Math.random() * 360) + 0);
    //random_angle = 306 * (Math.PI/180)
    y_center = disk_radius[0]*Math.cos(random_angle);
    x_center = disk_radius[1]*Math.sin(random_angle);
    circle_center = [y_center, x_center];
    //             constructor(currentScale, centerOfCircle_real, colour, canvas, gl) {
    circle_obj = new Circle(currentScale, circle_center, colour, canvas, gl);
    circle = circle_obj.disk();
    circle_obj.cirbleBindBuffers(gl);
    return circle;
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
    var xScale = 0.1, yScale = 0.1;
    var currentScale = [xScale, yScale];
    var circles = [];
    // number_of_possible_colours = bacteria_colours.length
    // random_colour = Math.floor((Math.random()*number_of_possible_colours) + 0); //0 to length
    // var colour = bacteria_colours[random_colour];//[1, 1, 1, 1]; //bacteria_colours

    // y_center = Math.floor((Math.random()*canvas.height) + 0)/canvas.height; //0 to length
    // x_center = Math.floor((Math.random()*canvas.width) + 0)/canvas.width; //0 to length
    // circle_center = [y_center, x_center];
    var desired_y_radius = canvas.height*(3/4);
    var desired_x_radius = canvas.width*(3/4);
    var wanted_radius = Math.min(desired_y_radius, desired_x_radius);
    
    disk_obj = new Circle([1,1], [0,0], [1,1,1,1], canvas, gl);
    disk = disk_obj.disk();
    disk_obj.cirbleBindBuffers(gl);
    //disk = circle_generator([10,10], [0, 0], [1, 1, 1, 1], canvas, gl)
    for(var i = 0; i < 2; i++) {
        circle = bacteria_generator(currentScale, canvas, gl, disk["radius"]);
        // circle = circle_generator(currentScale, circle_center, radius colour, canvas, gl)
        circles.push(circle);
    }
    
    /////////////////////////////////
    //            Drawing           //
    //////////////////////////////////
    var previousTime = 0;
    var scaleGrowthPerSecond = 0.0125;

    animateScene();
    function animateScene() { 
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

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

        //// DRAW DISK
        uScalingFactor = gl.getUniformLocation(program, "uScalingFactor");
        gl.uniform2f(uScalingFactor, disk['scale'][0], disk['scale'][1]);

        uCenter = gl.getUniformLocation(program, "uCenter");
        gl.uniform2f(uCenter, disk['center'][0], disk['center'][1]);

        uColour = gl.getUniformLocation(program, "vertColor");
        gl.uniform4f(uColour, disk['colour'][0], disk['colour'][1], disk['colour'][2], disk['colour'][3]);
        
        var verticesData = disk['vertices'];
        points = verticesData.length/2;
        gl.drawArrays(gl.TRIANGLE_FAN,0,points);
        ////

        for(var i = 0; i < circles.length; i++) {
            
            var currentCircle = circles[i];
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