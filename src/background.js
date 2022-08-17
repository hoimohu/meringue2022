let running = false;
(function () {
    const canvas = document.getElementById('background');
    const gl = canvas.getContext('webgl');

    let background_run = true;

    const starttime = Date.now();

    const vertexShaderSource = `attribute vec4 a_position;

void main() {
gl_Position = a_position;
}
`;

    const fragmentShaderSource = `precision mediump float;
uniform float iTime;
uniform vec2 iResolution;
uniform float connected;

void main(){
    vec3 d = vec3(abs(sin(iTime / 3.0)) / 2.0, abs(cos(iTime / 3.0)) / 2.0, abs(tan(iTime / 2.0)) / 4.0 + 0.5);
    gl_FragColor = vec4((gl_FragCoord.x / iResolution.x / 2.0 + d.x) * connected, gl_FragCoord.yx / iResolution.yx / 2.0 + d.yz, 1.0);
}
`;

    const UniformLocation = {
        t: null,
        r: null,
        c: null
    };
    let renderkey;
    function init() {
        if (background_run && gl) {
            canvas.width = innerWidth;
            canvas.height = innerHeight;


            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0, 0, 0, 0);

            function createShader(type, source) {
                const shader = gl.createShader(type);
                gl.shaderSource(shader, source);
                gl.compileShader(shader);

                const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
                if (success) {
                    return shader;
                }

                console.log(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
            }
            const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
            const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

            function createProgram(vertexShader, fragmentShader) {
                const program = gl.createProgram();
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);

                const success = gl.getProgramParameter(program, gl.LINK_STATUS);
                if (success) {
                    gl.useProgram(program);
                    return program;
                }

                console.log(gl.getProgramInfoLog(program));
                gl.deleteProgram(program);
            }
            const program = createProgram(vertexShader, fragmentShader);

            const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
            const positionBuffer = gl.createBuffer();
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            const positions = [
                -1, 1,
                -1, -1,
                1, 1,
                1, -1
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

            UniformLocation.t = gl.getUniformLocation(program, "iTime");
            UniformLocation.r = gl.getUniformLocation(program, 'iResolution');
            UniformLocation.c = gl.getUniformLocation(program, 'connected');

            const size = 2;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            let offset = 0;
            gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
            const key = Symbol();
            renderkey = key;
            new render(key);
        }
    }

    class render {
        constructor(key) {
            this.key = key;
            this.loop();
        }
        loop() {
            if (!(background_run && gl && this.key === renderkey)) {
                return;
            }

            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.uniform1f(UniformLocation.t, (Date.now() - starttime) / 1000);
            gl.uniform2fv(UniformLocation.r, [canvas.width, canvas.height]);
            gl.uniform1f(UniformLocation.c, ((!running) ? 3 : 1));

            let offset = 0;
            const count = 4;
            gl.drawArrays(gl.TRIANGLE_STRIP, offset, count);
            requestAnimationFrame(this.loop.bind(this));
        }
    }
    window.addEventListener('load', init);
    window.addEventListener('resize', init);
    window.addEventListener('orientationchange', init);
})();