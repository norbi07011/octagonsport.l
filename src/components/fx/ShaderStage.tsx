import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { hexToRgb, prefersReducedMotion } from '../../lib/motion';

/*
 * Żywe tło WebGL (shader liczony przez kartę graficzną):
 * płynący dym/światło w kolorze produktu, reflektor i podłoga (karuzela), pył w świetle,
 * fala uderzeniowa przy zmianie produktu, błysk, winieta i ziarno filmowe.
 * Kontekst WebGL tworzony jest tylko, gdy sekcja jest blisko ekranu (i zwalniany poza nim),
 * a pętla rysowania działa tylko, gdy sekcja jest widoczna – oszczędza baterię telefonu.
 * Gdy WebGL nie działa, pod spodem zostaje zwykły gradient CSS (fallback).
 */

export interface ShaderStageHandle {
  /** ustaw parametry sceny (wołane np. przy przewijaniu) */
  set: (u: Partial<{ focusX: number; focusY: number; intensity: number; flash: number }>) => void;
  /** wywołaj falę uderzeniową */
  pulse: () => void;
}

interface Props {
  color: string;
  mode: 'carousel' | 'story';
  /** zmiana tej wartości odpala falę uderzeniową */
  pulseKey?: string | number;
  className?: string;
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uColor;
uniform vec2 uMouse;
uniform vec2 uFocus;
uniform float uIntensity;
uniform float uPulse;
uniform float uFlash;
uniform float uMode;
varying vec2 vUv;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = vUv;
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - uFocus) * vec2(asp, 1.0);
  float t = uTime * 0.06;
  float d = length(p);

  // fala uderzeniowa – zniekształca dym i świeci pierścieniem
  float wave = 0.0;
  if (uPulse < 2.2) {
    float r = uPulse * 0.85;
    wave = exp(-pow((d - r) * 10.0, 2.0)) * (1.0 - uPulse / 2.2);
    p += normalize(p + 1e-4) * wave * 0.06;
  }

  // dym: domain-warped fbm
  vec2 q = vec2(fbm(p * 1.5 + t), fbm(p * 1.5 - t + 3.1));
  vec2 r2 = vec2(fbm(p * 2.1 + q * 1.8 + vec2(1.7, 9.2) + t * 1.3), fbm(p * 2.1 + q * 1.8 + vec2(8.3, 2.8) - t));
  float smoke = fbm(p * 1.3 + r2 * 1.7 + (uMouse - 0.5) * 0.5);

  // głęboka czerń + kolorowe smugi dymu skupione wokół produktu
  float wisps = smoothstep(0.38, 0.92, smoke);
  float core = exp(-d * d * 3.2);
  float halo = exp(-d * d * 0.9);
  float glow = core * (0.18 + 0.85 * wisps) + halo * wisps * 0.22;
  vec3 col = uColor;
  vec3 c = col * glow * uIntensity * 0.85;
  c += vec3(1.0) * pow(core, 9.0) * 0.06 * uIntensity;

  // tryb karuzeli: reflektor z góry i świecąca podłoga
  if (uMode < 0.5) {
    float spread = abs(uv.x - 0.5) * 1.7 - (1.0 - uv.y) * 0.42;
    float cone = smoothstep(0.42, 0.0, spread) * smoothstep(0.1, 1.0, uv.y);
    cone *= 0.55 + 0.45 * wisps;
    c += col * cone * 0.10 + vec3(cone * 0.035);
    float fl = exp(-pow((uv.y - 0.17) * 10.0, 2.0)) * exp(-pow((uv.x - 0.5) * 3.0, 2.0));
    c += col * fl * 0.32;
  }

  c += mix(col, vec3(1.0), 0.3) * wave * 0.8;

  // pył w świetle
  vec2 g = uv * vec2(asp, 1.0) * 26.0 + vec2(uTime * 0.05, uTime * 0.22);
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float h = hash(id);
  vec2 o = vec2(hash(id + 3.1) - 0.5, hash(id + 7.7) - 0.5) * 0.6;
  float sp = smoothstep(0.07, 0.0, length(f - o)) * step(0.88, h);
  float tw = 0.5 + 0.5 * sin(uTime * 2.0 + h * 40.0);
  c += mix(col, vec3(1.0), 0.6) * sp * tw * (0.12 + halo * 0.8);

  // błysk
  c = mix(c, col * 0.9 + 0.04, clamp(uFlash, 0.0, 1.0));

  // winieta + ziarno
  float vig = smoothstep(1.15, 0.25, length((uv - 0.5) * vec2(asp * 0.75, 1.0)));
  c *= vig;
  c += (hash(uv * uRes + fract(uTime * 7.0)) - 0.5) * 0.035;
  gl_FragColor = vec4(max(c, 0.0), 1.0);
}`;

export const ShaderStage = forwardRef<ShaderStageHandle, Props>(({ color, mode, pulseKey, className }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    color: hexToRgb(color),
    target: hexToRgb(color),
    focusX: 0.5,
    focusY: mode === 'carousel' ? 0.52 : 0.5,
    intensity: mode === 'carousel' ? 1 : 0.6,
    flash: 0,
    mouse: [0.5, 0.5] as [number, number],
    mouseT: [0.5, 0.5] as [number, number],
    pulseAt: -10,
    time: 0,
  });

  useImperativeHandle(ref, () => ({
    set: u => Object.assign(state.current, u),
    pulse: () => { state.current.pulseAt = state.current.time; },
  }), []);

  useEffect(() => { state.current.target = hexToRgb(color); }, [color]);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    state.current.pulseAt = state.current.time;
  }, [pulseKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = prefersReducedMotion();
    let gl: WebGLRenderingContext | null = null;
    let prog: WebGLProgram | null = null;
    let uni: Record<string, WebGLUniformLocation | null> = {};
    let raf = 0;
    let running = false;
    let last = 0;
    let quality = 0;
    let slowAcc = 0;
    let frames = 0;
    let skip = false;

    const init = () => {
      if (gl) return true;
      gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
      if (!gl) return false;
      const sh = (type: number, src: string) => {
        const s = gl!.createShader(type)!;
        gl!.shaderSource(s, src);
        gl!.compileShader(s);
        return gl!.getShaderParameter(s, gl!.COMPILE_STATUS) ? s : null;
      };
      const vs = sh(gl.VERTEX_SHADER, VERT);
      const fs = sh(gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) { gl = null; return false; }
      prog = gl.createProgram()!;
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; return false; }
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'aPos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      uni = Object.fromEntries(
        ['uRes', 'uTime', 'uColor', 'uMouse', 'uFocus', 'uIntensity', 'uPulse', 'uFlash', 'uMode'].map(n => [n, gl!.getUniformLocation(prog!, n)])
      );
      resize();
      return true;
    };

    const release = () => {
      stop();
      if (!gl) return;
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      gl = null;
      canvas.style.opacity = '0';
    };

    const resize = () => {
      if (!gl) return;
      // dym jest miękki – liczymy go w niższej rozdzielczości (oszczędność GPU/baterii);
      // na słabszych urządzeniach jakość obniża się automatycznie (quality 0..2)
      const small = window.innerWidth < 768;
      const scale = (small ? 0.55 : 0.5) * [1, 0.7, 0.5][quality];
      const w = Math.max(1, Math.round(canvas.clientWidth * scale));
      const h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const frame = (now: number) => {
      if (!gl) return;
      const raw = last ? (now - last) / 1000 : 0.016;
      const dt = Math.min(raw, 0.05);
      last = now;
      // automatyczna jakość: średni czas klatki > ~28 ms przez dłuższą chwilę → niższa rozdzielczość
      frames++;
      slowAcc += raw;
      if (frames >= 45) {
        const avg = slowAcc / frames;
        if (avg > 0.028 && quality < 2) quality++;
        else if (avg > 0.028 && quality === 2) skip = true; // ostatecznie: rysuj co drugą klatkę
        frames = 0;
        slowAcc = 0;
      }
      if (skip && (frames & 1)) { if (running && !reduced) raf = requestAnimationFrame(frame); return; }
      const s = state.current;
      s.time += dt;
      for (let i = 0; i < 3; i++) s.color[i] += (s.target[i] - s.color[i]) * Math.min(1, dt * 3.2);
      s.mouse[0] += (s.mouseT[0] - s.mouse[0]) * Math.min(1, dt * 2.5);
      s.mouse[1] += (s.mouseT[1] - s.mouse[1]) * Math.min(1, dt * 2.5);
      resize();
      gl.uniform2f(uni.uRes, canvas.width, canvas.height);
      gl.uniform1f(uni.uTime, s.time);
      gl.uniform3f(uni.uColor, s.color[0], s.color[1], s.color[2]);
      gl.uniform2f(uni.uMouse, s.mouse[0], s.mouse[1]);
      gl.uniform2f(uni.uFocus, s.focusX, s.focusY);
      gl.uniform1f(uni.uIntensity, s.intensity);
      gl.uniform1f(uni.uPulse, s.time - s.pulseAt);
      gl.uniform1f(uni.uFlash, s.flash);
      gl.uniform1f(uni.uMode, mode === 'carousel' ? 0 : 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (canvas.style.opacity !== '1') canvas.style.opacity = '1'; // pokaż dopiero po pierwszej klatce
      if (running && !reduced) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || !init()) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      state.current.mouseT = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // widoczność: rysuj tylko na ekranie, zwalniaj kontekst daleko poza ekranem
    const near = new IntersectionObserver(([e]) => { if (!e.isIntersecting) release(); }, { rootMargin: '150% 0px' });
    const vis = new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); else stop(); }, { rootMargin: '10% 0px' });
    near.observe(canvas);
    vis.observe(canvas);
    const onCtxLost = (e: Event) => { e.preventDefault(); gl = null; stop(); };
    canvas.addEventListener('webglcontextlost', onCtxLost);

    return () => {
      near.disconnect();
      vis.disconnect();
      window.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('webglcontextlost', onCtxLost);
      release();
    };
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ width: '100%', height: '100%', display: 'block', opacity: 0, transition: 'opacity 600ms ease' }}
    />
  );
});
ShaderStage.displayName = 'ShaderStage';
