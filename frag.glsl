void main(){
    float c = 3.0;
    vec3 d = vec3(abs(sin(iTime / 3.0)) / 2.0, abs(cos(iTime / 3.0)) / 2.0, abs(tan(iTime / 2.0)) / 4.0 + 0.5);
    gl_FragColor = vec4((gl_FragCoord.x / iResolution.x / 2.0 + d.x) * c, gl_FragCoord.yx / iResolution.yx / 2.0 + d.yz, 1.0);
}