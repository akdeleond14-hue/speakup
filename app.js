// Speak Up — app personal para practicar inglés hablado con personajes 3D.
// Todo corre en el navegador. Servicios: Gemini API (plan gratuito) con la clave de la usuaria.

let DEV = null; try { DEV = JSON.parse(localStorage.getItem('speakup.dev') || 'null'); } catch (e) {}
const API = DEV?.api || 'https://generativelanguage.googleapis.com/v1beta';
const LIVE_URL = DEV?.live || 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
const TH = 'https://cdn.jsdelivr.net/gh/met4citizen/TalkingHead@1.8/';
const DEFAULT_MODELS = { live: 'gemini-3.1-flash-live-preview', text: 'gemini-3.5-flash', textAlt: 'gemini-3.1-flash-lite', tts: 'gemini-3.1-flash-tts-preview' };
const NEED = 6;

const LEVELS = [
  { n: 'Mis primeras palabras', cefr: 'A1', talk: 'one very short sentence (3 to 7 words), present tense, the most common words, speak slowly and clearly, repeat key words, ask one simple yes/no or either/or question' },
  { n: 'Primeros pasos', cefr: 'A1+', talk: 'one or two short sentences, present tense, "I want / I like / can I", speak slowly and clearly, one simple question' },
  { n: 'Me defiendo', cefr: 'A2', talk: 'one or two simple sentences, present and simple past, everyday phrases, a little slower than normal, one question at a time' },
  { n: 'Conversadora', cefr: 'A2+', talk: 'two short natural sentences, past and future, follow-up questions about details, natural but clear pace' },
  { n: 'Independiente', cefr: 'B1', talk: 'natural sentences at normal pace, common expressions and idioms, ask why and her opinion, add one small unexpected problem' },
  { n: 'Profesional', cefr: 'B1+', talk: 'natural pace, workplace vocabulary, polite disagreement, ask her to explain and justify, one complication' },
  { n: 'Fluida', cefr: 'B2', talk: 'native-like pace, phrasal verbs, idioms, light humor, interruptions and tough pushback' }
];

const CHARS = [
  { id: 'emma', name: 'Emma', place: 'Café en Nueva York', scene: 'sc-cafe', col: '#8a4b2a', voice: 'Aoede',
    persona: 'a friendly barista in a cozy coffee shop in Brooklyn, New York; cheerful, curious, loves music',
    avatar: { url: TH + 'avatars/brunette.glb', body: 'F', avatarMood: 'happy', lipsyncLang: 'en' },
    sits: [
      { id: 'e1', lv: 1, t: 'Pedir un café', goal: 'Ana orders a drink at your counter', m: [['Saludar', 'greet each other'], ['Pedir una bebida y el tamaño', 'order a drink and choose a size'], ['Pagar y despedirte', 'pay and say goodbye']] },
      { id: 'e2', lv: 3, t: 'Tu fin de semana', goal: 'Ana is a regular customer; you chat about the weekend while she waits', m: [['Contar qué hiciste', 'tell what she did last weekend'], ['Preguntarle por el suyo', 'ask about your weekend'], ['Proponer un plan', 'suggest a plan together']] },
      { id: 'e3', lv: 5, t: 'Planear un viaje', goal: 'you and Ana, now friends, plan a short trip together', m: [['Proponer un destino', 'propose a destination'], ['Hablar del presupuesto', 'discuss the budget'], ['Acordar fechas', 'agree on dates']] }
    ] },
  { id: 'mike', name: 'Mike', place: 'Restaurante en Miami', scene: 'sc-rest', col: '#0e6e78', voice: 'Puck',
    persona: 'a relaxed, funny waiter at a seafood restaurant in Miami Beach; he talks a bit fast when excited',
    avatar: { url: TH + 'avatars/avatarsdk.glb', body: 'M', avatarMood: 'neutral', lipsyncLang: 'en',
      retarget: { Neck: { z: -0.01, rx: -0.15 }, Neck1: { z: -0.01, rx: -0.15 }, Neck2: { z: -0.01, rx: -0.15 }, LeftShoulder: { rz: -0.3 }, RightShoulder: { rz: 0.3 }, scaleToEyesLevel: 1.0, origin: { y: -0.1 } },
      baseline: { headRotateX: -0.04, eyeBlinkLeft: 0.05, eyeBlinkRight: 0.05 } },
    sits: [
      { id: 'm1', lv: 1, t: 'Pedir comida', goal: 'Ana is a customer at your table', m: [['Pedir una bebida', 'order a drink'], ['Pedir un plato', 'order a main dish'], ['Pedir la cuenta', 'ask for the check']] },
      { id: 'm2', lv: 3, t: 'Un problema con el pedido', goal: 'Ana received the wrong dish and you must help', m: [['Explicar el problema', 'explain what is wrong'], ['Pedir un cambio', 'ask for a change'], ['Aceptar la solución', 'accept a solution politely']] },
      { id: 'm3', lv: 6, t: 'Hablar de tu trabajo', goal: 'after your shift you chat with Ana, a civil engineer who also runs a restaurant project, about work', m: [['Contar a qué te dedicas', 'explain what she does for a living'], ['Explicar un proyecto', 'describe a project she is working on'], ['Responder preguntas difíciles', 'answer tough questions about it']] }
    ] },
  { id: 'sofia', name: 'Sofia', place: 'Hotel en Orlando', scene: 'sc-hotel', col: '#7a4cc2', voice: 'Kore',
    persona: 'a warm, professional hotel receptionist in Orlando, Florida',
    avatar: { url: TH + 'avatars/avaturn.glb', body: 'F', avatarMood: 'happy', lipsyncLang: 'en',
      retarget: { Hips: { y: 0.03 }, Spine: { y: 0.02 }, Spine1: { y: 0.02, z: 0.01 }, Spine2: { y: 0.02, z: 0.01 }, Neck: { z: 0.02, y: 0.01 }, Head: { z: 0.02 }, LeftShoulder: { rx: -0.5 }, RightShoulder: { rx: -0.5 }, scaleToHipsLevel: 1.0 },
      baseline: { headRotateX: -0.05, eyeBlinkLeft: 0.15, eyeBlinkRight: 0.15 } },
    sits: [
      { id: 's1', lv: 2, t: 'Hacer el check-in', goal: 'Ana arrives at your front desk', m: [['Dar tu nombre y reserva', 'give her name and reservation'], ['Preguntar por el desayuno', 'ask about breakfast'], ['Pedir la clave del wifi', 'ask for the wifi password']] },
      { id: 's2', lv: 4, t: 'Pedir indicaciones', goal: 'Ana wants to visit a place in the city and asks you how to get there', m: [['Preguntar cómo llegar', 'ask how to get there'], ['Preguntar por el transporte', 'ask about transport and cost'], ['Confirmar lo que entendió', 'repeat the directions to confirm']] },
      { id: 's3', lv: 5, t: 'Queja por la habitación', goal: 'Ana calls the desk because her room has a problem (no hot water and noise)', m: [['Explicar el problema', 'explain the problem'], ['Pedir una solución', 'ask for a solution'], ['Negociar una compensación', 'negotiate a discount or upgrade']] }
    ] },
  { id: 'lily', name: 'Lily', place: 'Parque en Austin', scene: 'sc-park', col: '#2f8a3b', voice: 'Leda',
    persona: 'a cheerful young local who walks her dog in a park in Austin, Texas; she loves food, dogs and live music',
    avatar: { url: TH + 'avatars/vroid.glb', body: 'F', avatarMood: 'happy', lipsyncLang: 'en', baseline: { headRotateX: -0.1, eyeBlinkLeft: 0.05, eyeBlinkRight: 0.05 } },
    sits: [
      { id: 'l1', lv: 1, t: 'Conocer a alguien', goal: 'you meet Ana for the first time on a bench in the park', m: [['Presentarte', 'say her name'], ['Decir de dónde eres', 'say where she is from'], ['Preguntarle algo a ella', 'ask you a question']] },
      { id: 'l2', lv: 2, t: 'Hobbies y familia', goal: 'you meet Ana again in the park and talk about life', m: [['Hablar de tus hobbies', 'talk about hobbies'], ['Hablar de tu familia', 'talk about family'], ['Decir tu comida favorita', 'say her favorite food']] },
      { id: 'l3', lv: 7, t: 'Debate: ciudad o campo', goal: 'a friendly debate: is life better in the city or in the countryside (Ana has a farm in Colombia)', m: [['Dar tu opinión', 'give her opinion'], ['Defenderla con razones', 'support it with reasons'], ['Responder a tus argumentos', 'respond to your counterarguments']] }
    ] },
  { id: 'grace', name: 'Grace', place: 'Aeropuerto JFK', scene: 'sc-air', col: '#1f6fd1', voice: 'Zephyr',
    persona: 'an efficient, kind airline agent at JFK airport in New York',
    avatar: { url: TH + 'avatars/brunette-t.glb', body: 'F', avatarMood: 'neutral', lipsyncLang: 'en' },
    sits: [
      { id: 'g1', lv: 2, t: 'Check-in del vuelo', goal: 'Ana checks in for her flight at your counter', m: [['Decir tu destino', 'say her destination'], ['Entregar la maleta', 'check her bag'], ['Pedir asiento de ventana', 'ask for a window seat']] },
      { id: 'g2', lv: 4, t: 'Vuelo retrasado', goal: 'Ana\'s flight is delayed four hours and she needs options', m: [['Preguntar qué pasó', 'ask what happened'], ['Preguntar las opciones', 'ask about her options'], ['Escoger una nueva reserva', 'choose a new booking']] },
      { id: 'g3', lv: 6, t: 'Entrevista migratoria', goal: 'you play a US immigration officer asking Ana routine questions on arrival', m: [['Explicar el motivo del viaje', 'explain the purpose of the trip'], ['Decir cuánto tiempo te quedas', 'say how long she will stay'], ['Decir dónde te alojas', 'say where she will stay']] }
    ] }
];

// ---------- estado ----------
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const today = () => new Date().toLocaleDateString('en-CA');
const KEY = 'speakup.v1';
let S = { apiKey: '', level: 1, levelStars: 0, xp: 0, streak: 0, lastDay: '', sessions: 0, friends: {}, words: [], history: [], models: { ...DEFAULT_MODELS }, duplex: false };
function merge(v) { if (v) S = { ...S, ...v, models: { ...DEFAULT_MODELS, ...(v.models || {}) } }; }
function load() { try { merge(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch (e) {} }
// Nube (Firebase): guarda progreso y clave en la cuenta de Google de Ana; sincroniza Mac ↔ iPhone.
const cloud = { on: false, user: null, ref: null, fs: null, timer: null, pending: false };
function save() {
  S.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  if (cloud.user) { clearTimeout(cloud.timer); cloud.pending = true; cloud.timer = setTimeout(pushCloud, 1500); }
}
async function pushCloud() {
  if (!cloud.user) return;
  try { const data = JSON.parse(JSON.stringify(S)); await cloud.fs.setDoc(cloud.ref, data); cloud.pending = false; }
  catch (e) { console.warn('No se pudo guardar en la nube', e); }
}
async function initCloud() {
  let cfg = null;
  try { cfg = (await import('./firebase-config.js')).default; } catch (e) {}
  if (!cfg || !cfg.apiKey) return false;
  const V = 'https://www.gstatic.com/firebasejs/11.0.2/';
  const [{ initializeApp }, auth, fs] = await Promise.all([import(V + 'firebase-app.js'), import(V + 'firebase-auth.js'), import(V + 'firebase-firestore.js')]);
  const app = initializeApp(cfg);
  cloud.auth = auth; cloud.a = auth.getAuth(app); cloud.fs = fs; cloud.db = fs.getFirestore(app); cloud.on = true;
  try { await auth.setPersistence(cloud.a, auth.browserLocalPersistence); } catch (e) {}
  auth.onAuthStateChanged(cloud.a, async user => {
    cloud.user = user;
    if (!user) { show('login'); return; }
    cloud.ref = fs.doc(cloud.db, 'users', user.uid);
    try {
      const snap = await fs.getDoc(cloud.ref);
      const remote = snap.exists() ? snap.data() : null;
      if (remote && (remote.updatedAt || 0) >= (S.updatedAt || 0)) { merge(remote); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
      else { await pushCloud(); }
      if (remote && !S.apiKey && remote.apiKey) S.apiKey = remote.apiKey;
    } catch (e) { toast('No pude leer tu progreso de la nube. Sigo con lo guardado en este dispositivo.'); }
    if (!talk.active) renderHome();
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && cloud.pending) pushCloud(); });
  return true;
}
async function login() {
  $('loginErr').innerHTML = '';
  try { await cloud.auth.signInWithPopup(cloud.a, new cloud.auth.GoogleAuthProvider()); }
  catch (e) { $('loginErr').innerHTML = '<div class="err">No pude entrar con Google (' + esc(e.code || e.message) + '). Si Safari bloqueó la ventana, vuelve a tocar el botón.</div>'; }
}
const L = () => LEVELS[S.level - 1];
const SECTIONS = ['login', 'setup', 'home', 'talk', 'summary', 'words', 'review', 'settings'];
function show(id) { for (const s of SECTIONS) $(s).classList.toggle('hidden', s !== id); window.scrollTo(0, 0); }
const due = () => S.words.filter(w => w.due <= Date.now());

// ---------- Gemini: texto y voz ----------
function friendlyErr(status, body) {
  if (status === 400 && /API key/i.test(body)) return 'La clave no es válida. Revísala en Ajustes.';
  if (status === 403) return 'La clave no tiene permiso. Crea una nueva en aistudio.google.com/apikey.';
  if (status === 429) return 'Llegaste al límite gratuito por ahora. Espera un minuto (o hasta mañana) y vuelve a intentar.';
  if (status === 404) return 'Google cambió el nombre del modelo. Revisa los modelos en Ajustes.';
  return 'No pude conectar con Gemini (' + status + ').';
}
async function gText(prompt, json = true) {
  let last = '';
  for (const model of [S.models.text, S.models.textAlt]) {
    try {
      const r = await fetch(`${API}/models/${model}:generateContent?key=${encodeURIComponent(S.apiKey)}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: json ? { responseMimeType: 'application/json', temperature: 0.4 } : { temperature: 0.6 } })
      });
      if (!r.ok) { last = friendlyErr(r.status, await r.text()); continue; }
      const d = await r.json();
      const t = (d.candidates?.[0]?.content?.parts || []).filter(p => !p.thought).map(p => p.text || '').join('');
      if (!json) return t;
      return JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
    } catch (e) { last = last || 'Error de red. Revisa tu conexión.'; }
  }
  throw new Error(last);
}
const b64ToBytes = b => { const s = atob(b); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
function bytesToB64(buf) { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
const ttsCache = new Map();
async function ttsPCM(text, voice = 'Kore') {
  const k = voice + '|' + text;
  if (ttsCache.has(k)) return ttsCache.get(k);
  const r = await fetch(`${API}/models/${S.models.tts}:generateContent?key=${encodeURIComponent(S.apiKey)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: 'Say this clearly and naturally, at a calm pace, in American English: ' + text }] }],
      generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } } })
  });
  if (!r.ok) throw new Error(friendlyErr(r.status, await r.text()));
  const d = await r.json();
  const part = (d.candidates?.[0]?.content?.parts || []).find(p => p.inlineData);
  if (!part) throw new Error('No llegó audio.');
  const bytes = b64ToBytes(part.inlineData.data);
  const pcm = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength >> 1);
  const rate = +(/rate=(\d+)/.exec(part.inlineData.mimeType || '')?.[1] || 24000);
  const out = { pcm, rate };
  ttsCache.set(k, out);
  return out;
}

// Reproductor simple (fuera de la escena 3D y como respaldo)
const player = {
  ctx: null, next: 0, src: [], endTimer: null, onEnd: null,
  ensure() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state !== 'running') this.ctx.resume(); return this.ctx; },
  push(pcm, rate = 24000) {
    const ctx = this.ensure();
    const f = new Float32Array(pcm.length); for (let i = 0; i < pcm.length; i++) f[i] = pcm[i] / 32768;
    const buf = ctx.createBuffer(1, f.length, rate); buf.getChannelData(0).set(f);
    const s = ctx.createBufferSource(); s.buffer = buf; s.connect(ctx.destination);
    const t = Math.max(ctx.currentTime + 0.03, this.next); s.start(t); this.next = t + buf.duration; this.src.push(s);
    clearTimeout(this.endTimer);
    this.endTimer = setTimeout(() => { this.src = []; this.onEnd && this.onEnd(); }, (this.next - ctx.currentTime) * 1000 + 60);
  },
  stop() { for (const s of this.src) { try { s.stop(); } catch (e) {} } this.src = []; this.next = 0; clearTimeout(this.endTimer); this.onEnd && this.onEnd(); }
};
async function sayText(text, voice) {
  // Toca primero el audio (gesto del usuario) y luego pide la voz
  player.ensure();
  try { const { pcm, rate } = await ttsPCM(text, voice); if (talk.active && talk.head) talk.speakPCM(pcm, rate); else player.push(pcm, rate); }
  catch (e) { toast(e.message); }
}
function toast(msg) { const d = document.createElement('div'); d.className = 'err'; d.textContent = msg; const host = document.querySelector('section:not(.hidden) main') || document.body; host.prepend(d); setTimeout(() => d.remove(), 6000); }

// ---------- Visemas por volumen (labios sincronizados con el audio) ----------
function ampVisemes(pcm, rate, offsetMs) {
  const win = Math.round(rate * 0.07), v = [], t = [], d = [];
  const cyc = ['aa', 'O', 'E', 'aa', 'I', 'U', 'O', 'E'];
  let k = 0;
  for (let i = 0; i + win <= pcm.length; i += win) {
    let sum = 0; for (let j = i; j < i + win; j += 2) sum += pcm[j] * pcm[j];
    const rms = Math.sqrt(sum / (win / 2));
    if (rms > 700) {
      const vis = rms > 5000 ? 'aa' : rms > 2500 ? cyc[k++ % cyc.length] : ['nn', 'I', 'E', 'DD'][k++ % 4];
      v.push(vis); t.push(offsetMs + (i / rate) * 1000); d.push(70);
    }
  }
  return { visemes: v, vtimes: t, vdurations: d };
}

// ---------- Conversación en vivo ----------
const MIC_WORKLET = `class M extends AudioWorkletProcessor{constructor(){super();this.r=sampleRate/16000;this.a=0;this.s=0;this.c=0;this.o=new Int16Array(1600);this.n=0}
process(i){const ch=i[0]&&i[0][0];if(!ch)return true;for(let k=0;k<ch.length;k++){this.s+=ch[k];this.c++;this.a+=1;if(this.a>=this.r){this.a-=this.r;let v=this.s/this.c;this.s=0;this.c=0;v=Math.max(-1,Math.min(1,v));this.o[this.n++]=v<0?v*32768:v*32767;if(this.n===this.o.length){this.port.postMessage(this.o.buffer,[this.o.buffer]);this.o=new Int16Array(1600);this.n=0}}}return true}}
registerProcessor('mic16k',M);`;

const talk = {
  active: false, ch: null, sit: null, head: null, ws: null, ready: false,
  micCtx: null, micStream: null, micNode: null, paused: false,
  avatarTalking: false, turnDone: true, audioEnded: true, vOff: 0,
  curThem: '', curMe: '', log: [], fixes: [], words: [], done: new Set(), okN: 0, totN: 0,
  themEl: null, meEl: null, silenceTimer: null, helped: false, closing: false, reconnects: 0,

  async open(ch, sit) {
    Object.assign(this, { active: true, ch, sit, ready: false, paused: false, avatarTalking: false, turnDone: true, audioEnded: true, curThem: '', curMe: '', log: [], fixes: [], words: [], done: new Set(), okN: 0, totN: 0, themEl: null, meEl: null, helped: false, closing: false, reconnects: 0, doneNoted: false });
    $('tName').textContent = ch.name + ' · ' + ch.place; $('tSit').textContent = sit.t + ' · Nivel ' + S.level + ' (' + L().cefr + ')';
    $('scene').className = 'scene ' + ch.scene; $('log').innerHTML = ''; $('cap').classList.add('hidden');
    $('fallback').classList.add('hidden'); $('avatar').innerHTML = ''; $('startOv').classList.remove('hidden');
    $('startTitle').textContent = 'Cargando a ' + ch.name + '…'; $('startTxt').textContent = 'La primera vez puede tardar unos segundos.'; $('startBtn').disabled = true;
    this.renderMis(); this.setStatus('Cargando…'); this.setMic('wait');
    show('talk');
    requestAnimationFrame(() => { $('stage').style.top = document.querySelector('#talk .bar').offsetHeight + 'px'; });
    addNote(`Misión con ${esc(ch.name)}: ${sit.m.map(x => esc(x[0])).join(' · ')}. Habla en inglés; si te trabas, toca <b>Ayúdame</b> o di algo en español y ${esc(ch.name)} te ayuda.`);
    try {
      const { TalkingHead } = await import('talkinghead');
      this.head = new TalkingHead($('avatar'), { lipsyncModules: ['en'], cameraView: 'upper', avatarIdleEyeContact: 0.6, avatarSpeakingEyeContact: 0.8 });
      await this.head.showAvatar(ch.avatar, ev => { if (ev.lengthComputable) $('startTxt').textContent = 'Cargando ' + Math.min(100, Math.round(ev.loaded / ev.total * 100)) + '%'; });
      await this.head.streamStart({ sampleRate: 24000, lipsyncType: 'visemes', lipsyncLang: 'en', waitForAudioChunks: true },
        () => { this.onAudioStart(); }, () => { this.onAudioEnd(); });
    } catch (e) {
      console.warn('3D no disponible', e); this.head = null;
      $('fallback').classList.remove('hidden'); $('face').style.background = ch.col; $('face').textContent = ch.name[0];
      player.onEnd = () => this.onAudioEnd();
    }
    if (!this.active) return;
    $('startTitle').textContent = '¿Lista para hablar con ' + ch.name + '?';
    $('startTxt').textContent = 'Toca el botón y permite el micrófono. ' + (S.duplex ? '' : 'Mientras ' + ch.name + ' habla, el micrófono espera; luego te toca.');
    $('startBtn').disabled = false; this.setStatus('Listo');
  },

  // Debe llamarse directamente desde el toque (iPhone exige un gesto para audio y micrófono)
  begin() {
    if (this.head?.audioCtx) this.head.audioCtx.resume();
    player.ensure();
    if (navigator.audioSession) { try { navigator.audioSession.type = 'play-and-record'; } catch (e) {} }
    this.micCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.micCtx.resume();
    $('startOv').classList.add('hidden');
    this.setStatus('Conectando…');
    this.startMic().then(() => this.connect()).catch(e => {
      addErr('No pude usar el micrófono. Revisa que Safari tenga permiso (Ajustes del iPhone > Safari > Micrófono). Mientras tanto puedes tocar <b>Escribir</b>.');
      this.connect();
    });
  },

  async startMic() {
    this.micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
    const url = URL.createObjectURL(new Blob([MIC_WORKLET], { type: 'application/javascript' }));
    await this.micCtx.audioWorklet.addModule(url);
    const src = this.micCtx.createMediaStreamSource(this.micStream);
    this.micNode = new AudioWorkletNode(this.micCtx, 'mic16k');
    this.micNode.port.onmessage = e => { if (this.micOpen()) this.send({ realtimeInput: { audio: { data: bytesToB64(e.data), mimeType: 'audio/pcm;rate=16000' } } }); };
    src.connect(this.micNode);
    const sink = this.micCtx.createGain(); sink.gain.value = 0; this.micNode.connect(sink); sink.connect(this.micCtx.destination);
  },
  micOpen() { return this.ready && !this.paused && this.ws?.readyState === 1 && (S.duplex || !this.avatarTalking); },

  systemPrompt(resume) {
    const f = S.friends[this.ch.id];
    return `You are ${this.ch.name}, ${this.ch.persona}. Situation: ${this.sit.goal}. Place: ${this.ch.place}.
You are talking face to face with Ana, a Colombian woman (native Spanish speaker) who is learning English. Her level is CEFR ${L().cefr}.
How to speak at her level: ${L().talk}.
Rules:
- Speak ONLY English. Keep every turn short. Never give long explanations.
- Stay in character, be warm and natural, and ask one question at a time.
- Gently guide the conversation so she practices these goals, in order: ${this.sit.m.map(x => x[1]).join('; ')}.
- If she speaks Spanish, or seems stuck, give her the exact short English phrase she needs and invite her to say it.
- Do not explain grammar; corrections appear on her screen. If she makes a mistake, naturally repeat her idea correctly in your answer.
- If she says goodbye or the goals are done, close the scene kindly in one sentence.
${f?.last ? `- You have met before. Last time you talked about: ${f.last}. You may mention it briefly.` : ''}
${resume ? `- The call was briefly cut. Continue naturally from here. Recent conversation:\n${this.transcript().slice(-1500)}` : '- Start by greeting her in character with one short line.'}`;
  },

  connect(resume = false) {
    this.ready = false; this.gotSetup = false;
    const voice = this.ch.voice;
    const ws = new WebSocket(LIVE_URL + '?key=' + encodeURIComponent(S.apiKey));
    ws.binaryType = 'arraybuffer';
    this.ws = ws;
    ws.onopen = () => ws.send(JSON.stringify({ setup: {
      model: 'models/' + S.models.live,
      generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
      systemInstruction: { parts: [{ text: this.systemPrompt(resume) }] },
      inputAudioTranscription: {}, outputAudioTranscription: {}
    } }));
    ws.onmessage = e => {
      let m; try { m = JSON.parse(typeof e.data === 'string' ? e.data : new TextDecoder().decode(e.data)); } catch (x) { return; }
      this.onServer(m);
    };
    ws.onerror = () => {};
    ws.onclose = ev => {
      if (this.ws !== ws) return;
      this.ready = false;
      if (!this.active || this.closing) return;
      const why = ev.reason || '';
      if (/API key|permission|unauth/i.test(why) || ev.code === 1008 && /key/i.test(why)) { addErr('La clave de Gemini no funcionó. Revísala en Ajustes.'); this.setStatus('Sin conexión'); this.setMic('wait'); return; }
      if (/quota|exhaust|rate/i.test(why) || ev.code === 1011 && /quota/i.test(why)) { addErr('Llegaste al límite gratuito por ahora. Toca Terminar para ver tu resumen y vuelve más tarde.'); this.setStatus('Límite gratuito'); this.setMic('wait'); return; }
      if (/not found|model/i.test(why)) { addErr('Google cambió el modelo de voz. Abre Ajustes y prueba otro nombre de modelo. (' + esc(why) + ')'); this.setStatus('Sin conexión'); this.setMic('wait'); return; }
      if (!this.gotSetup && this.reconnects >= 1) { addErr('No pude conectar con la voz de Gemini. Revisa tu clave en <b>Ajustes</b> y tu internet. Si todo está bien, puede que Google haya cambiado el modelo de voz (también en Ajustes). Toca el micrófono para reintentar.'); this.setStatus('Sin conexión'); this.setMic('wait'); return; }
      if (this.reconnects < 3) { this.reconnects++; this.setStatus('Reconectando…'); setTimeout(() => this.active && this.connect(true), 800); }
      else { addErr('Se cortó la conexión. Toca el micrófono para reconectar.'); this.setStatus('Desconectado'); this.setMic('wait'); }
    };
  },
  send(obj) { if (this.ws?.readyState === 1) this.ws.send(JSON.stringify(obj)); },

  onServer(m) {
    if (m.setupComplete) {
      this.ready = true; this.gotSetup = true; this.reconnects = 0; this.setStatus(this.avatarTalking ? this.ch.name + ' habla' : 'Te escucho'); this.setMic('on');
      if (!this.log.length && !this.curThem) this.send({ realtimeInput: { text: '(Ana has just arrived. Start the scene now.)' } });
      return;
    }
    if (m.goAway) { this.setStatus('Renovando la llamada…'); return; }
    const sc = m.serverContent; if (!sc) return;
    if (sc.inputTranscription?.text) { this.curMe += sc.inputTranscription.text; this.showMe(); this.armSilence(false); }
    for (const p of sc.modelTurn?.parts || []) {
      if (p.inlineData?.data) this.playChunk(p.inlineData.data, p.inlineData.mimeType);
    }
    if (sc.outputTranscription?.text) { this.curThem += sc.outputTranscription.text; this.showThem(); }
    if (sc.interrupted) { this.head ? this.head.streamInterrupt() : player.stop(); this.turnDone = true; this.finishTurn(true); }
    if (sc.turnComplete) { this.turnDone = true; this.head ? this.head.streamNotifyEnd() : null; this.finishTurn(false); this.maybeReopen(); }
  },

  playChunk(b64, mime) {
    const bytes = b64ToBytes(b64);
    const pcm = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength >> 1);
    const rate = +(/rate=(\d+)/.exec(mime || '')?.[1] || 24000);
    if (!this.avatarTalking) { this.avatarTalking = true; this.turnDone = false; this.setStatus(this.ch.name + ' habla'); this.setMic('mute'); this.armSilence(true); }
    this.audioEnded = false;
    if (this.head) {
      if (!this.head.isSpeaking) this.vOff = 0;
      const lip = ampVisemes(pcm, rate, this.vOff);
      this.vOff += pcm.length / rate * 1000;
      this.head.streamAudio({ audio: pcm, ...lip });
    } else {
      player.push(pcm, rate); this.bounce(pcm);
    }
  },
  speakPCM(pcm, rate) { // frases de "Escuchar" dentro de la escena
    const chunk = Math.round(rate * 0.5);
    this.avatarTalking = true; this.turnDone = true; this.setMic('mute');
    if (!this.head.isSpeaking) this.vOff = 0;
    for (let i = 0; i < pcm.length; i += chunk) {
      const part = pcm.slice(i, i + chunk); const lip = ampVisemes(part, rate, this.vOff); this.vOff += part.length / rate * 1000;
      this.head.streamAudio({ audio: part, ...lip });
    }
    this.head.streamNotifyEnd();
  },
  bounce(pcm) { let s = 0; for (let i = 0; i < pcm.length; i += 8) s += Math.abs(pcm[i]); const a = s / (pcm.length / 8); $('face').style.transform = 'scale(' + (1 + Math.min(0.12, a / 60000)) + ')'; setTimeout(() => { $('face').style.transform = ''; }, 120); },
  onAudioStart() { this.audioEnded = false; },
  onAudioEnd() { this.audioEnded = true; this.maybeReopen(); },
  maybeReopen() {
    if (!this.turnDone || !this.audioEnded) return;
    setTimeout(() => {
      if (!this.turnDone || !this.audioEnded) return;
      this.avatarTalking = false;
      if (this.ready) { this.setStatus(this.paused ? 'Micrófono en pausa' : 'Te escucho'); this.setMic(this.paused ? 'off' : 'on'); }
      this.armSilence(true);
    }, 350);
  },

  showThem() {
    const cap = $('cap'); cap.classList.remove('hidden'); cap.innerHTML = esc(this.curThem);
    if (!this.themEl) { this.themEl = addBubble('them', ''); }
    this.themEl.querySelector('.tx').textContent = this.curThem;
  },
  showMe() {
    if (!this.meEl) this.meEl = addBubble('me', '');
    this.meEl.querySelector('.tx').textContent = this.curMe;
  },
  finishTurn(interrupted) {
    const me = this.curMe.trim(), them = this.curThem.trim();
    const themEl = this.themEl, meEl = this.meEl;
    if (me) this.log.push({ who: 'Ana', text: me });
    if (them) this.log.push({ who: this.ch.name, text: them + (interrupted ? ' …' : '') });
    this.curMe = ''; this.curThem = ''; this.themEl = null; this.meEl = null; this.helped = false;
    if (them && themEl) {
      themEl.querySelector('.acts').innerHTML = `<button class="mini" data-say="${esc(them)}" data-voice="${this.ch.voice}">Escuchar otra vez</button>`;
    }
    if (me || them) this.analyze(me, them, meEl, themEl);
  },

  async analyze(me, them, meEl, themEl) {
    const lowLv = S.level <= 4;
    const prompt = `You help Ana, a Colombian Spanish speaker learning English at CEFR ${L().cefr}, in a role-play with ${this.ch.name} (${this.sit.goal}).
Mission goals: ${this.sit.m.map((x, i) => `m${i + 1}: ${x[1]}`).join('; ')}.
Conversation so far:
${this.transcript()}
Ana's last message: "${me}"
${this.ch.name}'s last message: "${them}"
Return JSON only:
{"translation":"Colombian Spanish translation of ${this.ch.name}'s last message","fix":{"ok":true,"es":"breve explicación en español de Colombia, máximo 20 palabras; si está bien, un elogio corto","native":"how a native speaker would say exactly what Ana meant"},"done":["ids of goals Ana has completed in the whole conversation, e.g. m1"],"words":[{"en":"useful word or short phrase from the conversation","es":"traducción"}]}
Rules: speech was transcribed automatically, so ignore capitalization, punctuation and tiny transcription slips. If Ana spoke Spanish, ok=false and native is the English way to say it. If Ana's message is empty, fix must be null. Give at most 2 words new for her level.`;
    try {
      const v = await gText(prompt);
      if (themEl && lowLv && v.translation) { const sm = document.createElement('small'); sm.textContent = v.translation; themEl.querySelector('.tx').after(sm); if (themEl === this.lastThem()) $('cap').innerHTML = esc(them) + '<small>' + esc(v.translation) + '</small>'; }
      if (me && v.fix) {
        this.totN++; if (v.fix.ok) this.okN++;
        if (!v.fix.ok && v.fix.native) this.fixes.push({ said: me, native: v.fix.native, es: v.fix.es });
        const d = document.createElement('div'); d.className = 'fix' + (v.fix.ok ? '' : ' no');
        d.innerHTML = `<b class="t">${v.fix.ok ? '¡Bien!' : 'Mejor así:'}</b> ${esc(v.fix.es)}${v.fix.native && !v.fix.ok ? `<div class="nat">${esc(v.fix.native)}</div><div class="acts"><button class="mini" data-say="${esc(v.fix.native)}" data-voice="Kore">Escuchar y repetir</button></div>` : ''}`;
        (meEl || $('log').lastElementChild).after(d);
      }
      for (const id of v.done || []) this.done.add(id);
      for (const w of v.words || []) if (w.en && !this.words.some(x => x.en.toLowerCase() === w.en.toLowerCase())) this.words.push(w);
      this.renderMis();
      if (this.done.size >= this.sit.m.length && !this.doneNoted) { this.doneNoted = true; addNote('¡Misión cumplida! Sigue hablando o toca <b>Terminar</b> para ver tu resumen.'); }
    } catch (e) { /* la conversación sigue aunque falle la corrección */ }
  },
  lastThem() { const all = $('log').querySelectorAll('.b.them'); return all[all.length - 1]; },

  armSilence(start) {
    clearTimeout(this.silenceTimer);
    if (!start) return;
    this.silenceTimer = setTimeout(() => { if (this.active && !this.avatarTalking && !this.curMe && !this.helped && this.ready) this.help(); }, 20000);
  },
  async help() {
    this.helped = true;
    const box = addNote('Pensando opciones…');
    try {
      const v = await gText(`Ana (Colombian, CEFR ${L().cefr}) is in a role-play with ${this.ch.name}: ${this.sit.goal}. Pending goals: ${this.sit.m.filter((x, i) => !this.done.has('m' + (i + 1))).map(x => x[1]).join('; ') || 'free conversation'}.
Conversation:
${this.transcript() || '(just started)'}
Give her two different short, natural answers she could say next (level ${L().cefr}). Return JSON only: {"options":[{"en":"...","es":"traducción"},{"en":"...","es":"..."}]}`);
      box.innerHTML = 'Toca una opción para escucharla y luego dila en voz alta:' + (v.options || []).map(o => `<button class="opt" data-say="${esc(o.en)}" data-voice="Kore">${esc(o.en)}<small>${esc(o.es)}</small></button>`).join('');
    } catch (e) { box.textContent = e.message; }
  },

  transcript() { return this.log.map(l => l.who + ': ' + l.text).join('\n'); },
  renderMis() { $('mis').innerHTML = this.sit.m.map((x, i) => `<span class="mi ${this.done.has('m' + (i + 1)) ? 'done' : ''}">${i + 1}. ${esc(x[0])}</span>`).join(''); },
  setStatus(t) { $('status').textContent = t; },
  setMic(state) { const b = $('micBtn'); b.className = 'mic ' + (state === 'on' ? 'on' : state === 'off' ? '' : 'wait'); $('micNote').textContent = state === 'on' ? 'Habla ahora. Toca el botón para pausar.' : state === 'off' ? 'Micrófono en pausa. Tócalo para seguir.' : state === 'mute' ? this.ch.name + ' está hablando…' : 'Preparando…'; },
  toggleMic() {
    if (!this.ws || this.ws.readyState > 1) { this.reconnects = 0; this.setStatus('Reconectando…'); this.connect(this.log.length > 0); return; }
    this.paused = !this.paused; this.setMic(this.paused ? 'off' : (this.avatarTalking ? 'mute' : 'on')); this.setStatus(this.paused ? 'Micrófono en pausa' : (this.avatarTalking ? this.ch.name + ' habla' : 'Te escucho'));
  },
  sendTyped(text) {
    if (!text.trim()) return;
    if (this.ws?.readyState !== 1) { addErr('No hay conexión. Toca el micrófono para reconectar.'); return; }
    this.curMe = text.trim(); this.showMe(); this.send({ realtimeInput: { text: text.trim() } });
  },
  close() {
    this.closing = true; this.active = false; clearTimeout(this.silenceTimer);
    try { this.ws?.close(); } catch (e) {} this.ws = null;
    try { this.micStream?.getTracks().forEach(t => t.stop()); } catch (e) {}
    try { this.micCtx?.close(); } catch (e) {} this.micCtx = null;
    try { this.head?.streamStop(); this.head?.stop(); } catch (e) {}
    this.head = null; $('avatar').innerHTML = ''; player.stop(); player.onEnd = null;
  }
};

function addBubble(who, text) {
  const d = document.createElement('div'); d.className = 'b ' + who;
  d.innerHTML = `<span class="tx">${esc(text)}</span><div class="acts"></div>`;
  $('log').appendChild(d); d.scrollIntoView({ block: 'end', behavior: 'smooth' }); return d;
}
function addNote(html) { const d = document.createElement('div'); d.className = 'card note'; d.style.margin = '0'; d.innerHTML = html; $('log').appendChild(d); d.scrollIntoView({ block: 'end', behavior: 'smooth' }); return d; }
function addErr(html) { const d = document.createElement('div'); d.className = 'err'; d.innerHTML = html; $('log').appendChild(d); d.scrollIntoView({ block: 'end', behavior: 'smooth' }); }

// ---------- Resumen ----------
async function finish() {
  const t = talk, ch = t.ch, sit = t.sit;
  const spoke = t.log.filter(l => l.who === 'Ana').length;
  const transcript = t.transcript(), fixes = t.fixes.slice(), words = t.words.slice(), done = new Set(t.done), okN = t.okN, totN = t.totN;
  t.close();
  if (!spoke) { renderHome(); return; }
  show('summary');
  $('sumBody').innerHTML = '<div class="card"><h2>Preparando tu resumen…</h2></div>';
  let v = null;
  try {
    v = await gText(`You are an English coach for Ana, a Colombian Spanish speaker at CEFR ${L().cefr}. Her role-play with ${ch.name} (${sit.goal}):
${transcript}
Corrections given during the chat: ${JSON.stringify(fixes)}
Return JSON only:
{"praise":"una o dos frases en español de Colombia sobre lo que hizo bien","errors":[{"pattern":"error repetido explicado en español en una frase","wrong":"ejemplo de lo que dijo","right":"versión correcta en inglés"}],"words":[{"en":"","es":"","example":"short English example sentence"}],"topic":"3 to 8 English words: what you talked about"}
errors: her most repeated or important mistakes, max 3, most frequent first (empty if none). words: exactly 5 useful words or phrases for her level from this scene.`);
  } catch (e) { toast(e.message); }
  const acc = totN ? okN / totN : 0, mr = done.size / sit.m.length;
  const stars = totN < 3 ? 0 : (mr >= 1 && acc >= 0.7 ? 3 : (mr >= 0.5 && acc >= 0.5 ? 2 : 1));
  let up = false;
  S.sessions++; S.xp += 20 + 5 * spoke + 10 * done.size;
  const d = today(); if (S.lastDay !== d) { const y = new Date(Date.now() - 864e5).toLocaleDateString('en-CA'); S.streak = S.lastDay === y ? S.streak + 1 : 1; S.lastDay = d; }
  if (S.level < LEVELS.length) { S.levelStars += stars; if (S.levelStars >= NEED) { S.level++; S.levelStars -= NEED; up = true; } }
  const errs = v?.errors?.length ? v.errors : fixes.slice(0, 3).map(f => ({ pattern: f.es, wrong: f.said, right: f.native }));
  const ws = (v?.words?.length ? v.words : words).slice(0, 5);
  const now = Date.now();
  for (const w of ws) if (w.en && !S.words.some(x => x.en.toLowerCase() === w.en.toLowerCase())) S.words.push({ en: w.en, es: w.es || '', example: w.example || '', box: 0, due: now, added: now });
  for (const e of errs) if (e.right && !S.words.some(x => x.en === e.right)) S.words.push({ en: e.right, es: e.pattern || '', example: 'Dijiste: ' + (e.wrong || ''), box: 0, due: now, added: now, fix: true });
  S.friends[ch.id] = { talks: (S.friends[ch.id]?.talks || 0) + 1, last: v?.topic || sit.goal };
  S.history.unshift({ date: d, ch: ch.id, sit: sit.id, stars, errors: errs, words: ws, transcript });
  S.history = S.history.slice(0, 30); S.words = S.words.slice(-400);
  save();
  const opened = up ? CHARS.flatMap(c => c.sits.filter(s => s.lv === S.level).map(s => c.name + ': ' + s.t)) : [];
  $('sumBody').innerHTML = `
  ${up ? `<div class="card" style="background:var(--tom);color:#fff;border:0;text-align:center"><h2>¡Subiste al nivel ${S.level}: ${esc(L().n)} (${L().cefr})!</h2><p>Los personajes te hablarán un poco más natural.${opened.length ? ' Nuevas situaciones: ' + esc(opened.join(', ')) + '.' : ''}</p></div>` : ''}
  <div class="card" style="text-align:center"><div class="stars" aria-label="${stars} estrellas">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
    <h2>Hablaste con ${esc(ch.name)}</h2><p>${esc(v?.praise || '¡Buen trabajo practicando!')}</p>
    <p class="note">Misiones: ${done.size} de ${sit.m.length} · Frases correctas: ${okN} de ${totN} · Racha: ${S.streak} día(s)</p>
    <p class="note">${totN < 3 ? 'Para ganar estrellas di al menos 3 frases.' : 'Para 3 estrellas: todas las misiones y 70% o más de frases correctas.'} ${S.level < LEVELS.length ? `Nivel ${S.level}: ${S.levelStars} de ${NEED} estrellas para el siguiente.` : 'Estás en el nivel más alto.'}</p></div>
  <div class="card"><h3>Tus errores más repetidos</h3>${errs.length ? errs.map(e => `<div class="li"><div class="es">${esc(e.pattern)}</div>${e.wrong ? `<div>Dijiste: <s>${esc(e.wrong)}</s></div>` : ''}<div class="en">${esc(e.right)} <button class="mini" data-say="${esc(e.right)}" data-voice="Kore">Escuchar</button></div></div>`).join('') : '<p>¡Ningún error importante esta vez!</p>'}</div>
  <div class="card"><h3>5 palabras nuevas</h3>${ws.length ? ws.map(w => `<div class="li"><div class="en">${esc(w.en)} <button class="mini" data-say="${esc(w.en)}" data-voice="Kore">Escuchar</button></div><div class="es">${esc(w.es)}${w.example ? ' · ' + esc(w.example) : ''}</div></div>`).join('') : '<p class="note">Sin palabras nuevas esta vez.</p>'}</div>
  <details class="card"><summary><b>Ver la conversación completa</b></summary><pre style="white-space:pre-wrap;font:15px/1.5 Nunito,sans-serif">${esc(transcript)}</pre></details>
  <div class="two"><button class="pri" data-go="home">Otra conversación</button><button class="yel" data-go="review">Repasar ahora</button></div>`;
}

// ---------- Inicio ----------
function renderHome() {
  if (!S.apiKey) { show('setup'); return; }
  $('hStreak').textContent = S.streak; $('hXp').textContent = S.xp; $('hWords').textContent = S.words.length; $('dueN').textContent = due().length;
  $('lvName').textContent = `Nivel ${S.level}: ${L().n}`; $('lvCefr').textContent = L().cefr;
  $('path').innerHTML = LEVELS.map((l, i) => `<span class="dot ${i + 1 < S.level ? 'past' : i + 1 === S.level ? 'now' : ''}" title="${esc(l.n)}">${l.cefr}</span>`).join('');
  const max = S.level >= LEVELS.length;
  $('lvFill').style.width = (max ? 100 : S.levelStars / NEED * 100) + '%';
  $('lvTxt').textContent = max ? '¡Nivel más alto! Sigue practicando.' : `${S.levelStars} de ${NEED} estrellas para el nivel ${S.level + 1} (${LEVELS[S.level].cefr}). Cada conversación da hasta 3.`;
  $('friends').innerHTML = CHARS.map(c => `<div class="friend"><div class="hd" style="background:${c.col}"><span class="ini">${c.name[0]}</span><div><h3>${c.name}</h3><small>${esc(c.place)}${S.friends[c.id] ? ' · ' + S.friends[c.id].talks + ' charla(s)' : ''}</small></div></div>
    ${c.sits.map(s => { const lk = s.lv > S.level; return `<button class="sit ${lk ? 'lock' : ''}" data-ch="${c.id}" data-sit="${s.id}" ${lk ? 'disabled' : ''}><span>${esc(s.t)}</span><span class="lv">${lk ? 'Nivel ' + s.lv : 'Hablar'}</span></button>`; }).join('')}</div>`).join('');
  show('home');
}

// ---------- Vocabulario y repaso ----------
function renderWords() {
  const list = [...S.words].reverse();
  $('wordsBody').innerHTML = `<div class="row" style="justify-content:space-between"><h2>Mis palabras (${list.length})</h2><button data-go="home">Volver</button></div>
  <div class="card">${list.length ? list.map(w => `<div class="li"><div class="en">${esc(w.en)} <button class="mini" data-say="${esc(w.en)}" data-voice="Kore">Escuchar</button></div><div class="es">${esc(w.es)}${w.example ? ' · ' + esc(w.example) : ''}</div><div class="note">Dominio: ${'●'.repeat(w.box + 1)}${'○'.repeat(4 - w.box)}</div></div>`).join('') : '<p>Aún no hay palabras. Termina una conversación y aquí aparecerán.</p>'}</div>`;
  show('words');
}
let rq = [], ri = 0;
function startReview() { rq = due().slice(0, 15); ri = 0; show('review'); drawCard(); }
function drawCard() {
  const c = rq[ri];
  if (!c) { $('revBody').innerHTML = `<div class="flash"><div class="q">${rq.length ? '¡Repaso terminado!' : 'No tienes repaso pendiente hoy.'}</div><p class="note">Las tarjetas vuelven en 1, 3, 7, 14 y 30 días según cómo te vaya.</p></div><button class="pri" style="width:100%" data-go="home">Volver</button>`; return; }
  $('revBody').innerHTML = `<p class="note">Tarjeta ${ri + 1} de ${rq.length} · dilo en voz alta antes de voltear</p>
  <div class="flash"><div class="note">${c.fix ? 'Corrige tu frase' : '¿Cómo se dice en inglés?'}</div><div class="q">${esc(c.fix ? c.example.replace(/^Dijiste: /, '') : c.es)}</div>${c.fix ? `<p class="note">${esc(c.es)}</p>` : ''}
  <div class="a hidden" id="ans">${esc(c.en)}${!c.fix && c.example ? `<div class="note">${esc(c.example)}</div>` : ''}</div></div>
  <div id="cAct"><button class="pri" style="width:100%" id="flip">Voltear y escuchar</button></div>`;
}
function grade(ok) { const c = rq[ri]; const days = [1, 3, 7, 14, 30]; c.box = ok ? Math.min(c.box + 1, 4) : 0; c.due = Date.now() + (ok ? days[c.box] : 0.25) * 864e5; if (ok) S.xp += 2; const d = today(); if (S.lastDay !== d) { const y = new Date(Date.now() - 864e5).toLocaleDateString('en-CA'); S.streak = S.lastDay === y ? S.streak + 1 : 1; S.lastDay = d; } save(); ri++; drawCard(); }

// ---------- Ajustes ----------
function renderSettings() {
  $('setBody').innerHTML = `<div class="row" style="justify-content:space-between"><h2>Ajustes</h2><button data-go="home">Volver</button></div>
  <div class="card"><label for="sKey">Clave de Gemini</label><input id="sKey" type="password" value="${esc(S.apiKey)}" autocomplete="off">
  <label><input type="checkbox" id="sDuplex" style="width:auto" ${S.duplex ? 'checked' : ''}> Uso audífonos (puedo interrumpir al personaje)</label>
  <p class="note">Sin audífonos déjalo apagado: así el personaje no se escucha a sí mismo por el altavoz.</p>
  <label for="sLevel">Nivel</label><select id="sLevel">${LEVELS.map((l, i) => `<option value="${i + 1}" ${i + 1 === S.level ? 'selected' : ''}>${i + 1} · ${l.cefr} · ${esc(l.n)}</option>`).join('')}</select>
  <details><summary class="note" style="margin-top:12px">Modelos de Google (solo si dejan de funcionar)</summary>
  <label for="mLive">Voz en vivo</label><input id="mLive" value="${esc(S.models.live)}"><label for="mText">Texto</label><input id="mText" value="${esc(S.models.text)}"><label for="mAlt">Texto (respaldo)</label><input id="mAlt" value="${esc(S.models.textAlt)}"><label for="mTts">Voz para escuchar frases</label><input id="mTts" value="${esc(S.models.tts)}"><button id="mReset" style="margin-top:8px">Restaurar modelos</button></details>
  <button class="pri" id="sSave" style="width:100%;margin-top:14px">Guardar</button></div>
  ${cloud.user ? `<div class="card"><h3>Tu cuenta</h3><p>Progreso guardado en la nube y sincronizado con tus otros dispositivos: <b>${esc(cloud.user.email || '')}</b></p><button id="logoutBtn">Salir de esta cuenta</button></div>` : ''}
  <div class="card"><h3>Copia de seguridad</h3><p class="note">Copia este código y guárdalo en tus Notas por si acaso. No incluye tu clave.</p>
  <textarea id="xCode" rows="3" readonly></textarea><div class="two" style="margin-top:8px"><button id="xCopy">Copiar mi código</button><button id="xImport">Pegar e importar</button></div></div>
  <p class="note">En el plan gratuito de Google, tus conversaciones pueden usarse para mejorar sus productos. Personajes 3D: TalkingHead (MIT) y avatares de ejemplo para uso personal no comercial.</p>`;
  const st = { ...S }; delete st.apiKey; $('xCode').value = btoa(unescape(encodeURIComponent(JSON.stringify(st))));
  show('settings');
}

// ---------- Eventos ----------
document.addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.say) { sayText(b.dataset.say, b.dataset.voice || 'Kore'); return; }
  if (b.dataset.go) { if (b.dataset.go === 'review') startReview(); else renderHome(); return; }
  if (b.dataset.ch) { const ch = CHARS.find(c => c.id === b.dataset.ch); talk.open(ch, ch.sits.find(s => s.id === b.dataset.sit)); return; }
  switch (b.id) {
    case 'loginBtn': login(); break;
    case 'logoutBtn': try { await cloud.auth.signOut(cloud.a); } catch (x) {} break;
    case 'keySave': {
      const k = $('keyIn').value.trim(); if (!k) return; S.apiKey = k; b.disabled = true; $('keyErr').innerHTML = '<p class="note">Comprobando…</p>';
      try { await gText('Reply with JSON {"ok":true}'); save(); renderHome(); }
      catch (x) { S.apiKey = ''; $('keyErr').innerHTML = '<div class="err">' + esc(x.message) + '</div>'; }
      b.disabled = false; break;
    }
    case 'startBtn': talk.begin(); break;
    case 'micBtn': talk.toggleMic(); break;
    case 'helpBtn': talk.help(); break;
    case 'typeBtn': $('typing').classList.toggle('hidden'); if (!$('typing').classList.contains('hidden')) $('typeIn').focus(); break;
    case 'typeSend': talk.sendTyped($('typeIn').value); $('typeIn').value = ''; break;
    case 'endBtn': finish(); break;
    case 'goReview': startReview(); break;
    case 'goWords': renderWords(); break;
    case 'goSettings': renderSettings(); break;
    case 'flip': { player.ensure(); $('ans').classList.remove('hidden'); sayText(rq[ri].en, 'Kore'); $('cAct').innerHTML = '<div class="two"><button class="nob" id="gNo">Me equivoqué</button><button class="okb" id="gOk">Lo dije bien</button></div>'; break; }
    case 'gOk': grade(true); break;
    case 'gNo': grade(false); break;
    case 'mReset': S.models = { ...DEFAULT_MODELS }; save(); renderSettings(); break;
    case 'sSave': {
      S.apiKey = $('sKey').value.trim(); S.duplex = $('sDuplex').checked; const lv = +$('sLevel').value; if (lv !== S.level) { S.level = lv; S.levelStars = 0; }
      S.models = { live: $('mLive').value.trim() || DEFAULT_MODELS.live, text: $('mText').value.trim() || DEFAULT_MODELS.text, textAlt: $('mAlt').value.trim() || DEFAULT_MODELS.textAlt, tts: $('mTts').value.trim() || DEFAULT_MODELS.tts };
      save(); renderHome(); break;
    }
    case 'xCopy': try { await navigator.clipboard.writeText($('xCode').value); b.textContent = '¡Copiado!'; } catch (x) { $('xCode').select(); b.textContent = 'Selecciónalo y cópialo'; } break;
    case 'xImport': {
      const code = window.prompt ? window.prompt('Pega aquí el código de tu otro dispositivo:') : '';
      if (!code) break;
      try { const v = JSON.parse(decodeURIComponent(escape(atob(code.trim())))); const key = S.apiKey; S = { ...S, ...v, apiKey: key, models: { ...DEFAULT_MODELS, ...(v.models || {}) } }; save(); renderHome(); }
      catch (x) { toast('Ese código no es válido.'); }
      break;
    }
  }
});
$('typeIn').addEventListener('keydown', e => { if (e.key === 'Enter') { talk.sendTyped($('typeIn').value); $('typeIn').value = ''; } });
document.addEventListener('visibilitychange', () => { if (!talk.head) return; document.visibilityState === 'visible' ? talk.head.start() : talk.head.stop(); });

load();
initCloud().then(on => { if (!on) renderHome(); }).catch(e => { console.warn(e); renderHome(); });
