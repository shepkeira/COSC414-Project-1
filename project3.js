var vertexShaderText = [
    'attribute vec2 vPosition;',
    'uniform vec2 uScalingFactor;',
    'uniform vec2 uRotationVector;',
    
    'void main()',
    '{',
    '	gl_Position = vec4(vPosition * uScalingFactor, 0, 1);',
    '}'
    ].join('\n');
    
var fragmentShaderText = [
    'precision mediump float;',
    'void main()',
    '{',
        
    '	gl_FragColor = vec4(1,1,0,1);',
    '}',
    ].join('\n')
    
    
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
    
        var program = gl.createProgram();
        gl.attachShader(program,vertexShader);
        gl.attachShader(program,fragmentShader);
    
        gl.linkProgram(program);
        if(!gl.getProgramParameter(program,gl.LINK_STATUS)){
            console.error('Error linking program!', gl.getProgramInfo(program));
            return;
        }
    
        //////////////////////////////////
        //    create circle buffer    //
        //////////////////////////////////
        var currentRoation = new Float32Array(2);
        currentRoation = [0, 1];
        var currentScale = new Float32Array(2);
        currentScale = [1.0, 1.0];
        var currentAngle = 0;

    
        var xCenterOfCircle = 0;
        var yCenterOfCircle = 0;
        var centerOfCircle = new Float32Array(2);
        centerOfCircle[0] = xCenterOfCircle;
        centerOfCircle[1] = yCenterOfCircle;
        var noOfFans = 80;
        var attributes = 2;
        var anglePerFan = (2*Math.PI) / noOfFans;
        var verticesData = []
        verticesData.push(xCenterOfCircle);
        verticesData.push(yCenterOfCircle);
        var desired_y_radius = canvas.height*(3/4);
        var desired_x_radius = canvas.width*(3/4);
        var desired_radius = Math.min(desired_y_radius, desired_x_radius);
        var xRadius = desired_radius/canvas.width;
        var yRadius = desired_radius/canvas.height;

        for(var i = 0; i <= noOfFans; i++) {
            var angle = anglePerFan * i;
            var xCoordinate = xCenterOfCircle + Math.cos(angle) * xRadius;
            var yCoordinate = yCenterOfCircle + Math.sin(angle) * yRadius;
            var point = new Float32Array(2);
            point[0] = xCoordinate;
            point[1] = yCoordinate;
            verticesData.push(xCoordinate);
            verticesData.push(yCoordinate);
        }

        verticesData = verticesData.flat();
    
        var circleVertexBufferObject = gl.createBuffer();
        //set the active buffer to the triangle buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBufferObject);
        //gl expecting Float32 Array not Float64
        //gl.STATIC_DRAW means we send the data only once (the triangle vertex position
        //will not change over time)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticesData), gl.STATIC_DRAW);

        //////////////////////////////////
        //            Drawing           //
        //////////////////////////////////
        var previousTime = 0;
        var scaleGrowthPerSecond = 0.1;

        animateScene();
            
        function animateScene() {
            gl.clearColor(1.,0.0,0.0,1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(program);

            uScalingFactor = gl.getUniformLocation(program, "uScalingFactor");
            gl.uniform2fv(uScalingFactor, currentScale);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexBufferObject);

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
            
            gl.drawArrays(gl.TRIANGLE_FAN,0,verticesData.length/attributes);

            window.requestAnimationFrame(function(currentTime) {
                var deltaScale = ((currentTime - previousTime) / 1000) * scaleGrowthPerSecond;
                currentScale[0] += deltaScale;
                currentScale[1] += deltaScale;
                previousTime = currentTime;
                animateScene();
            })
        };

        canvas.onmousedown = function(ev) {
            scaleGrowthPerSecond += 0.1;
        }
        
            
    };

