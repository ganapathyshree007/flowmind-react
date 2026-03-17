import { useEffect, useRef, useCallback } from 'react';

/* ──────────────────────────────────────────────────────────
   Orb — WebGL iridescent orb background
   Props:
     hue            (number, 0-360) — primary hue
     hoverIntensity (number)        — how much brighter on hover
     rotateOnHover  (bool)          — rotate the orb on mouse hover
     forceHoverState(bool)          — always appear hovered
   ────────────────────────────────────────────────────────── */

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;

uniform float u_time;
uniform vec2  u_res;
uniform vec2  u_mouse;       // normalised 0-1
uniform float u_hue;         // 0-360
uniform float u_intensity;   // base + hover boost
uniform float u_rotation;    // extra angle from hover rotation

// Simplex noise helpers
vec3 mod289v3(vec3 x){ return x - floor(x*(1./289.))*289.; }
vec2 mod289v2(vec2 x){ return x - floor(x*(1./289.))*289.; }
vec3 permute(vec3 x){ return mod289v3(((x*34.)+1.)*x); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865,0.366025404,-0.577350269,0.024390244);
  vec2 i  = floor(v + dot(v,C.yy));
  vec2 x0 = v - i + dot(i,C.xx);
  vec2 i1 = (x0.x>x0.y) ? vec2(1.,0.) : vec2(0.,1.);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289v2(i);
  vec3 p = permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m = max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
  m=m*m; m=m*m;
  vec3 x2 = 2.*fract(p*C.www)-1.;
  vec3 h   = abs(x2)-0.5;
  vec3 ox  = floor(x2+0.5);
  vec3 a0  = x2-ox;
  m *= 1.79284291-0.85373472*(a0*a0+h*h);
  vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}

// HSL → RGB
vec3 hsl2rgb(float h, float s, float l){
  h = mod(h,360.)/360.;
  float r,g,b;
  float q = l<0.5 ? l*(1.+s) : l+s-l*s;
  float p = 2.*l-q;
  vec3 t = vec3(h+1./3., h, h-1./3.);
  t = mod(t+1.,1.);
  vec3 col;
  if(t.x<1./6.) r=p+(q-p)*6.*t.x;
  else if(t.x<0.5) r=q;
  else if(t.x<2./3.) r=p+(q-p)*(2./3.-t.x)*6.;
  else r=p;
  if(t.y<1./6.) g=p+(q-p)*6.*t.y;
  else if(t.y<0.5) g=q;
  else if(t.y<2./3.) g=p+(q-p)*(2./3.-t.y)*6.;
  else g=p;
  if(t.z<1./6.) b=p+(q-p)*6.*t.z;
  else if(t.z<0.5) b=q;
  else if(t.z<2./3.) b=p+(q-p)*(2./3.-t.z)*6.;
  else b=p;
  return vec3(r,g,b);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  // flip Y so mouse coords match
  uv.y = 1.0 - uv.y;

  // aspect-correct centered coords
  float aspect = u_res.x / u_res.y;
  vec2 center = vec2(0.5, 0.5);
  vec2 p = (uv - center) * vec2(aspect, 1.0);

  // rotate around centre based on mouse / time
  float angle = u_rotation + u_time * 0.12;
  float ca = cos(angle), sa = sin(angle);
  p = vec2(p.x*ca - p.y*sa, p.x*sa + p.y*ca);

  // Orb radius (slightly elliptical)
  float r = length(p * vec2(1.0, 1.25));

  // soft sphere mask
  float sphere = smoothstep(0.52, 0.0, r);
  if(sphere < 0.001) { gl_FragColor = vec4(0.); return; }

  float t = u_time;

  // layered noise for iridescent surface
  float n1 = snoise(p * 2.2 + vec2(t*0.18, t*0.11));
  float n2 = snoise(p * 4.5 - vec2(t*0.14, t*0.22) + 1.7);
  float n3 = snoise(p * 1.1 + vec2(t*0.07,-t*0.09) + 3.3);
  float n  = (n1*0.5 + n2*0.3 + n3*0.2) * 0.5 + 0.5;

  // hue shift across surface
  float hueShift = u_hue + n * 80.0 - 40.0
                 + (1.0 - r) * 30.0
                 + snoise(p*3.0 + t*0.3) * 25.0;

  // mouse proximity brightens the orb
  vec2 mouseP = (u_mouse - center) * vec2(aspect, 1.0);
  float mouseDist = length(mouseP - p);
  float mouseGlow = smoothstep(0.6, 0.0, mouseDist) * 0.35 * u_intensity;

  // core glow (brighter inside)
  float core  = pow(max(0., 1.0 - r * 1.8), 2.5) * 0.9;
  float rim   = pow(1.0 - smoothstep(0.0, 0.52, r), 3.0) * 0.5;

  float brightness = 0.35 + core * 0.45 + rim * 0.25 + mouseGlow;
  float saturation = 0.75 + n * 0.25;
  brightness *= u_intensity;
  brightness  = clamp(brightness, 0.0, 1.0);

  vec3 col = hsl2rgb(hueShift, saturation, brightness * 0.6);

  // fresnel-like rim highlight
  float fresnel = pow(r / 0.52, 4.0) * 0.6;
  vec3 rimCol   = hsl2rgb(u_hue + 60., 0.9, 0.8);
  col = mix(col, rimCol, fresnel * sphere);

  // specular highlight
  vec2 lightDir = normalize(vec2(-0.5, -0.6));
  float spec = pow(max(0., dot(normalize(-p), lightDir)), 8.0) * 0.4 * sphere;
  col += vec3(spec);

  float alpha = sphere * (0.82 + core * 0.18) * clamp(u_intensity * 0.9, 0.5, 1.0);

  gl_FragColor = vec4(col * alpha, alpha);
}
`;

function compileShader(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error('Orb shader error:', gl.getShaderInfoLog(sh));
  }
  return sh;
}

function buildProgram(gl) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compileShader(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  return prog;
}

export default function Orb({
  hue            = 200,
  hoverIntensity = 0.3,
  rotateOnHover  = true,
  forceHoverState = false,
  style          = {},
}) {
  const canvasRef   = useRef(null);
  const rafRef      = useRef(null);
  const startRef    = useRef(null);
  const mouseRef    = useRef({ x: 0.5, y: 0.5 });
  const hoverRef    = useRef(forceHoverState ? 1 : 0);
  const rotRef      = useRef(0);
  const glState     = useRef({});

  // Keep forceHoverState reactive
  useEffect(() => { hoverRef.current = forceHoverState ? 1 : hoverRef.current; }, [forceHoverState]);

  // Mouse tracking on the parent element / window
  const onMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top)  / rect.height,
    };
    hoverRef.current = 1;
    if (rotateOnHover) {
      const cx = e.clientX - rect.left - rect.width  * 0.5;
      const cy = e.clientY - rect.top  - rect.height * 0.5;
      rotRef.current = Math.atan2(cy, cx) * 0.4;
    }
  }, [rotateOnHover]);

  const onMouseLeave = useCallback(() => {
    if (!forceHoverState) hoverRef.current = 0;
  }, [forceHoverState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const prog = buildProgram(gl);
    gl.useProgram(prog);

    // Quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const U = {
      time      : gl.getUniformLocation(prog, 'u_time'),
      res       : gl.getUniformLocation(prog, 'u_res'),
      mouse     : gl.getUniformLocation(prog, 'u_mouse'),
      hue       : gl.getUniformLocation(prog, 'u_hue'),
      intensity : gl.getUniformLocation(prog, 'u_intensity'),
      rotation  : gl.getUniformLocation(prog, 'u_rotation'),
    };

    gl.uniform1f(U.hue, hue);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    glState.current = { gl, prog, buf, U };

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.res, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    startRef.current = performance.now();

    let targetIntensity = forceHoverState ? 1 + hoverIntensity : 1;
    let currentIntensity = targetIntensity;

    const render = (now) => {
      const elapsed = (now - startRef.current) / 1000;

      // smooth hover intensity lerp
      targetIntensity = hoverRef.current ? (1 + hoverIntensity) : 1.0;
      currentIntensity += (targetIntensity - currentIntensity) * 0.06;

      gl.uniform1f(U.time, elapsed);
      gl.uniform2f(U.mouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(U.intensity, currentIntensity);
      gl.uniform1f(U.rotation, rotRef.current);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hue, hoverIntensity, rotateOnHover, forceHoverState]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}
