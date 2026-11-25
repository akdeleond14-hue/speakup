# Recon map: LingoLooper (iOS / Android) → clon personal web (MacBook + iPhone)

Alcance: el ciclo central de LingoLooper (conversación hablada con personajes 3D en escenas de la vida real, con retroalimentación, sugerencias, transcripción, vocabulario y progreso). Solo inglés.
Para: uso personal de Ana Karina (no comercial). Nivel de entrada A1. Restricción: **costo cero** (solo herramientas y planes gratuitos).
Plataformas del clon: navegador (Safari/Chrome) en MacBook y en iPhone; instalable en la pantalla de inicio del iPhone.
Fecha: 2026-11-24

## Reglas aplicadas

- Solo fuentes públicas (ficha de App Store, sitios de reseñas, prensa). No se usó ninguna cuenta, ni código, ni APIs privadas de LingoLooper.
- No se copian personajes, nombres, textos, logos, voces ni modelos 3D del original. Todo se crea nuevo.
- Sin capturas de pantalla guardadas: no se accedió a la app. Las pantallas de abajo se infieren de las descripciones públicas (confianza media).

## Fuentes

| # | fuente | URL | notas |
| --- | --- | --- | --- |
| 1 | Ficha App Store (descripción + historial de versiones 0.14 → 0.22.2) | https://apps.apple.com/app/id1670913076 | La fuente más completa: funciones, mundos, precios, cambios recientes |
| 2 | AlternativeTo | https://alternativeto.net/software/lingolooper/about | Etiquetas: speaking, 3D avatars, gamification |
| 3 | AppAdvice | https://appadvice.com/app/lingolooper-ai-language-game/1670913076 | Retroalimentación, dificultad adaptativa, LingoLeague |
| 4 | G2 | https://www.g2.com/products/lingolooper/discuss | Retroalimentación después de cada conversación |
| 5 | Adapty paywall library | https://adapty.io/paywall-library/lingolooper/ | Precios del premium |
| 6 | thinkinitalian.com (reseña) | https://www.thinkinitalian.com/app-review/lingolooper | Puntos débiles: conversaciones repetitivas, falta de lecciones estructuradas |
| 7 | barrazacarlos.com | https://barrazacarlos.com/?p=391449 | Sesiones de 10 min, métricas tras cada conversación |

## Ciclo central

Escoger un personaje en un lugar del mundo 3D → hablar con él en voz alta sobre un tema de la vida real → recibir sugerencias mientras hablas y retroalimentación al final → guardar vocabulario y subir de nivel.

## Pantallas (inferidas)

| ID | pantalla | cómo se llega | propósito | componentes clave | estados |
| --- | --- | --- | --- | --- | --- |
| S01 | Bienvenida / onboarding | primera apertura | idioma, nivel, perfil (edad, género), tutorial | pasos, selector de nivel | primera vez |
| S02 | Mapa / mundo 3D | inicio | elegir ciudad y lugar (café, gym, oficina, parque, barrio, hospital, centro, alcaldía) | escena 3D, marcadores de lugares | cargando, lleno |
| S03 | Selector de personaje | tocar un lugar | ver avatares con personalidad, intereses y origen cultural | tarjetas de personaje, relación/amistad | lleno, bloqueado |
| S04 | Selector de tema | antes de conversar | tema predefinido o propio (noticias, deportes, cultura) | lista de temas, campo de tema propio | vacío, lleno |
| S05 | Conversación (el núcleo) | iniciar charla | hablar por voz con el avatar 3D | avatar con sincronización de labios, botón de micrófono, modo manos libres, subtítulos, sugerencias en pantalla, ayuda de pronunciación, traducción | escuchando, pensando, hablando, sin micrófono, error de red |
| S06 | Resultado / retroalimentación | al terminar | evaluación de vocabulario, gramática, estilo, fluidez; métricas | tarjetas de feedback, puntaje, monedas | lleno |
| S07 | Transcripción | desde S06 o historial | revisar, escuchar mensajes, tocar palabras para ver definición y guardarlas, descargar | burbujas, palabra resaltada, botón leer en voz alta | vacío, lleno |
| S08 | Centro de vocabulario | pestaña | palabras guardadas, dominio, repaso | lista, barra de dominio, botón repasar | vacío, lleno |
| S09 | Repaso de vocabulario | desde S08 | practicar palabras de las conversaciones | tarjetas, respuesta, progreso | sin pendientes, en curso, terminado |
| S10 | Progreso | pestaña | racha, congelador de racha, monedas, nivel | contadores, calendario | sin datos, lleno |
| S11 | Liga / amigos | pestaña | competir, agregar amigos por código | tabla, código | (fuera de alcance) |
| S12 | Ajustes / perfil | menú | idioma de traducción, dialecto, formalidad, cuenta | formularios | — |
| S13 | Pago / suscripción | bloqueo premium | trial de 7 días, mensual, anual | paywall | (fuera de alcance) |

## Flujos

```
F01 Tener una conversación hablada (núcleo)
    S02 -> S03 -> S04 -> S05 -> S06
    clics del camino feliz: ~4 (lugar, personaje, tema, iniciar) + hablar
    edge: sin permiso de micrófono, ruido, se queda callada, no entiende al avatar, red lenta, sesión larga

F02 Pedir ayuda en medio de la charla
    S05 (sugerencia en pantalla / pronunciación / traducción) -> S05
    edge: sugerencia demasiado difícil para el nivel

F03 Revisar y guardar vocabulario
    S06 -> S07 (tocar palabra) -> guardar -> S08
    edge: palabra ya guardada

F04 Repasar vocabulario
    S08 -> S09 -> S10 (racha sube)
    edge: nada pendiente hoy

F05 Mantener la racha
    notificación "racha en riesgo" -> F01 o F04
    edge: día perdido → congelador de racha

F06 Primera vez
    S01 (nivel, perfil, tutorial) -> S02
```

## Componentes

| componente | variantes | estados | usado en |
| --- | --- | --- | --- |
| Botón | primario, secundario, fantasma | normal, presionado, foco, deshabilitado, cargando | todas |
| Botón de micrófono | toque para hablar, manos libres | inactivo, escuchando, procesando, sin permiso | S05 |
| Avatar 3D parlante | por personaje | quieto, escuchando, pensando, hablando (labios sincronizados), emoción | S03, S05 |
| Escena 3D | por lugar | cargando, lista | S02, S05 |
| Burbuja / subtítulo | avatar, usuaria | normal, traducido, palabra resaltada | S05, S07 |
| Tarjeta de sugerencia | 2-3 opciones | visible, usada | S05 |
| Tarjeta de feedback | vocabulario, gramática, estilo, fluidez | buena, a mejorar | S06 |
| Tarjeta de personaje | — | disponible, bloqueado, amigo | S03 |
| Tarjeta de repaso | palabra, frase | frente, reverso, acierto, fallo | S09 |
| Contador | racha, monedas, nivel | — | S10, cabecera |

## Modelo de datos inferido

```
Perfil        nombre, idioma_meta, nivel, edad_grupo, formalidad, idioma_traduccion
              evidencia: S01, versión 0.15.0 (perfil) · confianza: alta
Personaje     nombre, personalidad, intereses, origen_cultural, voz, modelo_3d, historia(20+ piezas), relacion
              evidencia: versiones 0.14.1, 0.19.0 · confianza: alta
Lugar         ciudad, tipo (café, gym, oficina...), escena_3d
              evidencia: descripción App Store · confianza: alta
Tema          titulo, tipo (predefinido | propio)
              evidencia: versión 0.22.0 · confianza: alta
Conversacion  perfil, personaje, lugar, tema, inicio, fin, nivel_usado
Mensaje       conversacion, quien, texto, audio?, traduccion, pistas_pronunciacion
              evidencia: transcripciones descargables · confianza: alta
Feedback      conversacion, vocabulario, gramatica, estilo, fluidez, puntaje
              evidencia: G2, barrazacarlos · confianza: alta
PalabraGuardada  texto, significado, origen (mensaje), dominio, proximo_repaso
              evidencia: centro de conocimiento, versión 0.21.0 · confianza: alta (proximo_repaso: suposición)
Progreso      racha, congeladores, monedas, xp, nivel
              evidencia: versiones 0.20.0, 0.21.0 · confianza: alta
```

Relaciones: Perfil 1-n Conversacion; Conversacion 1-n Mensaje; Conversacion 1-1 Feedback; Mensaje 1-n PalabraGuardada; Personaje n-1 Lugar.

## Matriz de funciones

Ver `features.csv`. Must: 16, should: 9, could: 5, skip: 5.

## Fuera de alcance (no se puede o no se debe clonar)

- Sus 1.000+ personajes, sus nombres, historias, voces y modelos 3D: son de ellos. Se crean personajes propios.
- LingoLeague, amigos y notificaciones sociales: es su red de usuarios; además, es una app para una sola persona.
- Pagos y suscripción: es para uso personal y gratis.
- 29 idiomas: solo inglés.
- Las ciudades 3D exactas: se crean escenas propias más sencillas.

## Herramientas gratuitas encontradas (para el Paso 2)

| necesidad | herramienta gratuita | estado verificado |
| --- | --- | --- |
| Conversación por voz fluida (escucha y responde hablando) | Gemini Live API, modelo `gemini-3.1-flash-live-preview` | Plan gratuito: entrada y salida "Free of charge" (ai.google.dev/gemini-api/docs/pricing, leído 2026-11-24). Límites de uso solo visibles en Google AI Studio. En el plan gratuito Google usa los datos para mejorar sus productos. |
| Correcciones, resumen, sugerencias (texto) | `gemini-3.5-flash` / `gemini-3.1-flash-lite` | Gratis en el plan gratuito |
| Voz de respaldo | `gemini-3.1-flash-tts-preview` | Gratis en el plan gratuito |
| Avatar 3D con labios sincronizados | TalkingHead (biblioteca JavaScript libre, three.js) | Activa; los avatares de Ready Player Me ya no se pueden crear (cerró el 31-01-2026) → usar modelos 3D libres compatibles |
| Micrófono en iPhone | getUserMedia en Safari | El reconocimiento de voz nativo de Safari no funciona confiablemente como app instalada; por eso el audio va directo a Gemini Live |
| Alojamiento | GitHub Pages o Cloudflare Pages | Gratis |
| Guardar progreso y sincronizar Mac ↔ iPhone | Almacenamiento local + (opcional) Supabase plan gratuito | Por confirmar en el Paso 2 |

## Tamaño

Pantallas 11 (sin S11 y S13), flujos 6, entidades 9.
Partes difíciles: (1) conversación de voz en tiempo real con Gemini Live desde el navegador del iPhone; (2) avatar 3D con labios sincronizados al audio y que corra fluido en el iPhone; (3) mantener costo cero: límites del plan gratuito y modelos "preview" que Google puede cambiar.
Tamaño: **L** (varias semanas por partes). Se puede entregar por etapas: primero la conversación por voz con un personaje, luego el 3D, luego el resto.
