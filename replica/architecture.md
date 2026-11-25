# Arquitectura: Speak Up (clon personal de LingoLooper)

Lee: `replica/recon.md`, `replica/features.csv`. Restricción principal: **costo cero**. Plataforma: Safari en MacBook e iPhone (no hace falta instalar en la pantalla de inicio).

## Stack (todo gratis)

| capa | elección | por qué |
| --- | --- | --- |
| App | Una página web estática (HTML + JavaScript, sin compilar) | Se publica gratis, abre en Safari del Mac y del iPhone, nada que instalar |
| Conversación por voz | Gemini Live API por WebSocket, `gemini-3.1-flash-live-preview` (configurable) | Voz natural en tiempo real, detecta sola cuándo terminas de hablar; plan gratuito "Free of charge" |
| Correcciones, traducción, ayuda, resumen | Gemini API texto, `gemini-3.5-flash` (respaldo `gemini-3.1-flash-lite`) | Gratis; respuestas en JSON |
| Voz para "Escuchar" y repaso | Gemini TTS `gemini-3.1-flash-tts-preview` | Gratis, misma calidad natural |
| Personajes 3D | TalkingHead 1.7 (three.js 0.180) desde jsDelivr | Avatar 3D con labios, gestos, mirada; corre en el navegador |
| Modelos 3D | Avatares de ejemplo del repo de TalkingHead (brunette, brunette-t, avaturn, avatarsdk, vroid) | Gratis para uso personal no comercial (brunette: CC BY-NC 4.0). Uso personal: permitido |
| Datos | localStorage del navegador (por dispositivo) + exportar/importar progreso con un código | Gratis, sin cuentas. Sincronización automática Mac↔iPhone queda para después |
| Hosting | GitHub Pages, repositorio en la cuenta `akdeleond14-hue` | Gratis, HTTPS (necesario para el micrófono) |

La clave de Gemini **no va en el código**: la app la pide una vez y la guarda solo en el navegador de Ana.

## Datos (en localStorage, clave `speakup.v1`)

```
state = {
  apiKey, level (1..7), levelStars, xp, streak, lastDay, sessions,
  friends: { [charId]: { talks, lastTopic } },
  words:  [ { en, es, example, box (0..4), due (ms), added } ],
  history:[ { date, charId, situationId, stars, errors:[...], words:[...], transcript:[{who,text}] } ]  (últimas 30)
}
```

Niveles: 1 A1, 2 A1+, 3 A2, 4 A2+, 5 B1, 6 B1+, 7 B2. Seis estrellas suben de nivel.

## Personajes y situaciones

5 amigos fijos (como "hacer amistad" en el original), cada uno con un lugar y situaciones que se abren por nivel:
Emma (café, Nueva York), Mike (restaurante, Miami), Sofia (hotel, Orlando), Lily (parque, Austin), Grace (aeropuerto, JFK).
Cada uno recuerda de qué hablaron la última vez.

## Flujo de una conversación (F01)

1. Tocar "Empezar" (gesto necesario en iPhone para audio y micrófono).
2. Abrir WebSocket → enviar `setup` (modelo, voz del personaje, instrucciones según nivel y situación, transcripción de entrada y salida).
3. Micrófono → AudioWorklet → PCM 16 kHz → `realtimeInput.audio` cada ~100 ms.
   Medio dúplex: mientras el personaje habla no se envía micrófono (evita que se escuche a sí mismo por el altavoz del iPhone).
4. Audio del personaje (PCM 24 kHz) → `head.streamAudio` con visemas calculados por volumen → labios sincronizados.
5. `outputTranscription` → subtítulo; `inputTranscription` → lo que dijo Ana.
6. Al terminar cada turno: una llamada de texto → traducción al español (niveles A1–A2), corrección breve de la frase de Ana, misiones cumplidas, palabras útiles.
7. "Ayúdame" o 20 s en silencio → dos opciones de respuesta con traducción.
8. "Terminar" → resumen (estrellas, errores repetidos, 5 palabras) → vocabulario al repaso.

Sesiones de Live tienen duración limitada: con `goAway` o cierre, la app ofrece "Continuar" y reconecta con un resumen de lo hablado.

## Partes delicadas

- **Audio en iPhone:** AudioContext se crea/reanuda solo tras un toque; frecuencia nativa 48 kHz → se reduce a 16 kHz en el worklet.
- **Eco:** medio dúplex por defecto; interruptor "Puedo interrumpir" para usar auriculares.
- **Límites del plan gratuito:** desconocidos hasta ver AI Studio; manejar errores 429 con mensaje claro y reintento.
- **Modelos preview:** el nombre del modelo es configurable en Ajustes por si Google lo cambia.
- **3D en iPhone:** modelos de 3–14 MB; se cargan una vez (caché del navegador). Si WebGL falla, avatar 2D de respaldo y la voz sigue funcionando.
- **Privacidad:** en el plan gratuito Google usa los datos para mejorar sus productos.

## Orden de construcción

1. Corte vertical: clave → un personaje → conversación por voz con 3D → subtítulos. (S05, F01)
2. Traducción, corrección por turno, ayuda, misiones. (S05, F02)
3. Resumen, transcripción, vocabulario, repaso, racha, niveles. (S06–S10, F03–F05)
4. Ajustes, exportar/importar progreso. (S12)
