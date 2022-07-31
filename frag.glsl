void main(){
    vec3 d = vec3(abs(sin(iTime / 3.0)) / 2.0, abs(cos(iTime / 3.0)) / 2.0, abs(tan(iTime / 2.0)) / 4.0 + 0.5);
    gl_FragColor = vec4(gl_FragCoord.xyx / iResolution.xyx / 2.0 + d , 1.0);
}