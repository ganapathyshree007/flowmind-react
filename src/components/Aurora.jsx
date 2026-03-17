import { useEffect, useRef } from 'react';

/* Aurora — WebGL aurora borealis animation
   Props: colorStops (hex[]), amplitude, blend, speed */

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2  u_res;
uniform vec3  u_c1;
uniform vec3  u_c2;
uniform vec3  u_c3;
uniform float u_amp;
uniform float u_blend;

vec3 mod289(vec3 x){return x - floor(x*(1./289.))*289.;}
vec2 mod289(vec2 x){return x - floor(x*(1./289.))*289.;}
vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865,0.366025404,-0.577350269,0.024390244);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.,0.) : vec2(0.,1.);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m = max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m = m*m; m = m*m;
  vec3 x  = 2.*fract(p*C.www)-1.;
  vec3 h  = abs(x)-0.5;
  vec3 ox = floor(x+0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291-0.85373472*(a0*a0+h*h);
  vec3 g;
  g.x  = a0.x*x0.x  + h.x*x0.y;
  g.yz = a0.yz*x12.xz + h.yz*x12.yw;
  return 130.*dot(m,g);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float t  = u_time * 0.18;

  float n1 = snoise(vec2(uv.x*1.8 + t*0.22, t*0.14)) * u_amp;
  float n2 = snoise(vec2(uv.x*2.4 - t*0.17, t*0.28 + 1.5)) * u_amp;
  float n3 = snoise(vec2(uv.x*1.2 + t*0.10, t*0.19 + 3.1)) * u_amp;

  float wave = uv.y + (n1+n2+n3)*0.18;

  vec3 col = u_c1;
  col = mix(col, u_c2, smoothstep(0.25, 0.55, wave));
  col = mix(col, u_c3, smoothstep(0.55, 0.85, wave));

  float mask = smoothstep(0.05, 0.35, wave) * (1.0 - smoothstep(0.65, 0.95, wave));
  float alpha = mask * u_blend * 0.82;

  gl_FragColor = vec4(col, alpha);
}
`;

function createShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return sh;
}

function createProgram(gl) {
  const prog = gl.createProgram();
  gl.attachShader(prog, createShader(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, createShader(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  return prog;
}

export default function Aurora({
  colorStops = ['#5227FF', '#7cff67', '#5227FF'],
  amplitude = 1.0,
  blend = 0.5,
  speed = 1.0,
  style = {},
}) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const startRef  = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const prog = createProgram(gl);
    gl.useProgram(prog);

    // Full-screen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTime  = gl.getUniformLocation(prog, 'u_time');
    const uRes   = gl.getUniformLocation(prog, 'u_res');
    const uC1    = gl.getUniformLocation(prog, 'u_c1');
    const uC2    = gl.getUniformLocation(prog, 'u_c2');
    const uC3    = gl.getUniformLocation(prog, 'u_c3');
    const uAmp   = gl.getUniformLocation(prog, 'u_amp');
    const uBlend = gl.getUniformLocation(prog, 'u_blend');

    const [c1, c2, c3] = colorStops.map(hexToRgb);
    gl.uniform3fv(uC1, c1);
    gl.uniform3fv(uC2, c2);
    gl.uniform3fv(uC3, c3);
    gl.uniform1f(uAmp, amplitude);
    gl.uniform1f(uBlend, blend);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    startRef.current = performance.now();

    const render = (now) => {
      gl.uniform1f(uTime, ((now - startRef.current) / 1000) * speed);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [colorStops, amplitude, blend, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        display: 'block', pointerEvents: 'none',
        ...style,
      }}
    />
  );
}
