import React, { useState, useRef } from 'react';
import Navbar from './components/Navbar';
import ScrollIndicator from './components/ScrollIndicator';
import CardTilt from './components/CardTilt';
import {
  Play, Pause, Volume2, VolumeX, Download,
  ChevronLeft, ChevronRight, FileText, Code,
  Gamepad2, Info, ArrowDown, ExternalLink, ShieldCheck, Users
} from 'lucide-react';
import './App.css';
import { playClickSound, playHoverSound, playFanfareSound } from './utils/audio';

// Technical documentation content for the interactive reader
const DOCS_PAGES = [
  {
    title: "1. Diseño de Cartas (CardUI)",
    content: `<h3>1.1. Nodo y Escena Base</h3>
    <p>Empezamos creando la escena de las cartas usando un nodo de tipo <strong>User Interface</strong> al que llamamos <code>CardUI</code>. Elegimos este nodo porque facilita el comportamiento dentro de contenedores y menús.</p>
    <p>Para la visualización, agregamos un <code>ColorRect</code> para el fondo y un <code>Label</code> para texto. Se crea un recurso de Tema llamado <code>Main.theme</code> configurando el tamaño de fuente a 6 píxeles y cargando una tipografía pixel art para evitar que se vea distorsionada a resoluciones pequeñas.</p>
    <h3>1.2. Detección de Soltado (Drop Detectors)</h3>
    <p>Añadimos un nodo <code>Area2D</code> llamado <code>DropPointDetector</code> con un <code>CollisionShape2D</code> rectangular. Esto detecta colisiones con la zona superior de soltado (<code>CardDropArea</code> en la escena de batalla <code>battle.tscn</code>). Configuramos las capas de colisión: la carta en la Capa 1 y la zona de soltado en la Capa 2.</p>`
  },
  {
    title: "2. Máquina de Estados de la Carta",
    content: `<h3>2.1. Arquitectura de Estados</h3>
    <p>Creamos un script base <code>card_state.gd</code> (hereda de <code>RefCounted</code>) que define la interfaz común con los métodos: <code>enter()</code>, <code>exit()</code> y <code>on_input()</code>.</p>
    <p>La máquina de estados se controla desde <code>card_state_machine.gd</code>, colocada en un nodo hijo dentro de la carta para delegar el control visual de forma aislada.</p>
    <h3>2.2. Arrastre y Reparentado</h3>
    <p>Definimos dos estados principales: <code>card_base_state.gd</code> (carta quieta en mano) y <code>card_dragging_state.gd</code> (carta siguiendo al ratón). Durante el arrastre, movemos temporalmente la carta al grupo global de la capa superior <code>UI_Layer</code> (reparentado) para que se dibuje por encima de todos los elementos y no se recorte por los límites de la mano.</p>`
  },
  {
    title: "3. Recursos y Curva de Apuntado",
    content: `<h3>3.1. Recursos de Cartas (Custom Resources)</h3>
    <p>Las cartas se modelan mediante recursos personalizados (<code>card.gd</code> heredando de <code>Resource</code>). Esto nos permite crear archivos de datos reutilizables (<code>.tres</code>) como <code>warrior_axe_attack.tres</code> y <code>warrior_block.tres</code> para configurar costes, daño y objetivos en el inspector sin escribir código adicional.</p>
    <h3>3.2. Curva Parabólica de Ataque</h3>
    <p>Para apuntar a enemigos individuales, instanciamos la escena <code>card_target_selector.tscn</code>, que dibuja una curva parabólica dinámica (nodo <code>Line2D</code> en la escena <code>card_arc.tscn</code>). Mediante una función matemática en <code>card_target_selector.gd</code>, calculamos puntos intermedios entre la carta y la punta del ratón para replicar la flecha curvada clásica de Slay the Spire.</p>`
  },
  {
    title: "4. Inteligencia Artificial y Acciones",
    content: `<h3>4.1. Acciones Probabilísticas</h3>
    <p>Los enemigos ejecutan movimientos definidos a través de recursos (<code>enemy_action.gd</code>) para acciones como atacar, defender o hacer un megabloqueo. La IA selecciona sus acciones utilizando un sistema probabilístico basado en un peso decimal de 0.0 a 10.0 configurado en el inspector.</p>
    <h3>4.2. Interfaz de Intención (Intent UI)</h3>
    <p>Para mostrar las intenciones del enemigo en el turno actual, creamos la escena <code>intent_ui.tscn</code> colocada en la parte superior del sprite del monstruo. El script <code>intent_ui.gd</code> lee la acción cargada del enemigo y muestra un icono y texto descriptivo correspondientes para que el jugador planee su defensa.</p>`
  },
  {
    title: "5. Generación del Mapa de la Torre",
    content: `<h3>5.1. Estructura de Datos de Salas</h3>
    <p>El mapa se genera como un grafo dirigido sin ciclos (DAG) en memoria. Cada nodo es un recurso <code>room_node.gd</code> con un tipo de sala (START, MONSTER, ELITE, CAMPFIRE, SHOP, EVENT, BOSS) y una lista de referencias en <code>next_rooms</code>.</p>
    <h3>5.2. Algoritmo del Mapa</h3>
    <p>El script <code>map_generator.gd</code> crea una matriz de 15 filas por 7 columnas. Se garantiza un inicio bifurcado en 3 salas y un Boss final unificado. Los caminos se trazan limitando las conexiones a una columna de distancia entre pisos (columnas $\pm1$). En la pantalla, instanciamos líneas punteadas <code>Line2D</code> (<code>map_line.tscn</code>) que unen los botones de las salas.</p>`
  }
];

function App() {
  // Video Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoRef = useRef(null);

  // Doc Reader States
  const [currentDocPage, setCurrentDocPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Toggle Video Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Toggle Video Mute
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Update Progress Bar
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setVideoProgress(progress || 0);
  };

  // Seek Video
  const handleVideoSeek = (e) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    videoRef.current.currentTime = percentage * videoRef.current.duration;
  };

  // Scroll to section manually
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Navigation Headers and Progress Lines */}
      <Navbar />
      <ScrollIndicator />

      {/* SECTION 1: INICIO */}
      <section id="inicio" className="section">
        {/* Ambient Decorative Glows */}
        <div className="bg-ambient-glow" style={{ top: '5%', right: '10%', width: '600px', height: '600px' }} />
        <div className="bg-ambient-glow" style={{ bottom: '10%', left: '5%', width: '400px', height: '400px' }} />

        <div className="section-container grid-two-cols">
          {/* Main Info */}
          <div className="inicio-info">
            <div className="project-badge">
              <span className="badge-dot" />
              <span>Proyecto en Godot 4.2</span>
            </div>

            <h1 className="inicio-title">
              El Ascenso <br />
              <span className="gradient-text">del barajas</span>
            </h1>

            <div className="inicio-text-content">
              <p className="lead-paragraph">
                Esta página reúne la documentación exhaustiva del desarrollo de un clon completo de <strong>Slay the Spire en Godot 4.2</strong>.
              </p>
              <p>
                Encontrarás todo lo que necesitas saber: desde la mecánica de cartas y combate, hasta sistemas de IA, generación procedural de mapas y reliquias. Un recurso ideal para aprender patrones avanzados de desarrollo, arquitectura de juegos y buenas prácticas en diseño de software.
              </p>
              <p>
                Ya seas desarrollador, estudiante o simplemente curioso, aquí descubrirás cómo se construye un juego roguelike profesional.
              </p>
            </div>

            <div className="inicio-actions">
              <button
                onClick={() => { playFanfareSound(); scrollToSection('video'); }}
                onMouseEnter={() => playHoverSound()}
                className="btn-primary"
              >
                Comienza a explorar <ArrowDown size={18} />
              </button>
              <button
                onClick={() => { playClickSound(); scrollToSection('documentacion'); }}
                onMouseEnter={() => playHoverSound()}
                className="btn-secondary"
              >
                Ver Documentación
              </button>
            </div>
          </div>

          {/* Side Cards Showcase */}
          <div className="inicio-cards-showcase">
            <div className="card-wrapper card-pos-1">
              <CardTilt
                cost="1"
                name="Golpe de Barajas"
                type="Ataque"
                rarity="Common"
                description="Inflige <strong>6</strong> de daño. Si tienes cartas de oro, añade 1 copia a tu mano."
              />
            </div>
            <div className="card-wrapper card-pos-2">
              <CardTilt
                cost="2"
                name="Ola de Fuego"
                type="Poder"
                rarity="Rare"
                description="Al principio de tu turno, inflige <strong>3</strong> de daño a TODOS los enemigos por cada carta de oro."
              />
            </div>
            <div className="card-wrapper card-pos-3">
              <CardTilt
                cost="1"
                name="Defensa Perfecta"
                type="Habilidad"
                rarity="Uncommon"
                description="Obtén <strong>8</strong> de Bloqueo. Gana 1 de Fuerza al final del turno."
              />
            </div>

            {/* Background decoration representing card shadows */}
            <div className="cards-shadow-bg" />
          </div>
        </div>
      </section>

      {/* SECTION 2: VIDEO */}
      <section id="video" className="section bg-dark-secondary">
        <div className="bg-ambient-glow" style={{ top: '30%', left: '10%', width: '500px', height: '500px' }} />

        <div className="section-container">
          <div className="section-header text-center">
            <h2 className="section-title">Demostración en Video</h2>
            <div className="section-divider" />
            <p className="section-subtitle">
              Observa el clon en acción corriendo directamente en Godot 4.2. Se puede ver el mazo de cartas y los efectos.
            </p>
          </div>

          {/* Premium Custom Video Player */}
          <div className="video-player-wrapper glass-card">
            <div className="player-screen">
              <video
                ref={videoRef}
                className="game-video"
                src="./2026-06-17 22-55-39.mp4"
                loop
                onTimeUpdate={handleTimeUpdate}
                onClick={() => { playClickSound(); togglePlay(); }}
                poster="./Portada.png"
              />

              {/* Play Overlay Button */}
              {!isPlaying && (
                <div className="play-overlay" onClick={() => { playClickSound(); togglePlay(); }}>
                  <div className="play-overlay-button">
                    <Play size={40} className="play-icon-glow" />
                  </div>
                </div>
              )}
            </div>

            {/* Custom Control Bar */}
            <div className="player-controls">
              <button
                className="control-btn"
                onClick={() => { playClickSound(); togglePlay(); }}
                onMouseEnter={() => playHoverSound()}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              {/* Progress Bar Timeline */}
              <div
                className="timeline-container"
                onClick={(e) => { playClickSound(); handleVideoSeek(e); }}
                onMouseEnter={() => playHoverSound()}
              >
                <div className="timeline-background">
                  <div className="timeline-fill" style={{ width: `${videoProgress}%` }} />
                  <div className="timeline-handle" style={{ left: `${videoProgress}%` }} />
                </div>
              </div>

              {/* Mute Control */}
              <button
                className="control-btn"
                onClick={() => { playClickSound(); toggleMute(); }}
                onMouseEnter={() => playHoverSound()}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: DOCUMENTACION */}
      <section id="documentacion" className="section">
        <div className="bg-ambient-glow" style={{ bottom: '15%', right: '5%', width: '500px', height: '500px' }} />

        <div className="section-container">
          <div className="section-header text-center">
            <h2 className="section-title">Manual de Documentación</h2>
            <div className="section-divider" />
            <p className="section-subtitle">
              Explora las guías de arquitectura, algoritmos y diseño del clon de Slay the Spire.
            </p>
          </div>

          <div className="doc-viewer-grid">
            {/* Table of Contents / Sidebar */}
            <div className="doc-sidebar glass-card">
              <h3 className="sidebar-heading">Capítulos del PDF</h3>
              <ul className="doc-index-list">
                {DOCS_PAGES.map((page, index) => (
                  <li key={index}>
                    <button
                      className={`doc-index-btn ${currentDocPage === index ? 'active' : ''}`}
                      onClick={() => { playClickSound(); setCurrentDocPage(index); }}
                      onMouseEnter={() => playHoverSound()}
                    >
                      <FileText size={16} />
                      <span>{page.title.split('.')[1] || page.title}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="doc-download-box">
                <p>Descarga la documentación completa en formato PDF original para leerla sin conexión.</p>
                <a
                  href="./SlayTheSpire100%.pdf"
                  download
                  onClick={() => playClickSound()}
                  onMouseEnter={() => playHoverSound()}
                  className="btn-primary full-width"
                >
                  <Download size={16} /> Descargar PDF
                </a>
              </div>
            </div>

            {/* Simulated PDF Document Page */}
            <div className="doc-page-container glass-card">
              <div className="doc-page-header">
                <div className="pdf-badge">
                  <span className="pdf-icon">PDF</span>
                  <span>SlayTheSpire100%.pdf</span>
                </div>

                {/* Zoom Toggles */}
                <div className="zoom-controls">
                  <button
                    onClick={() => { playClickSound(); setZoomLevel(Math.max(80, zoomLevel - 10)); }}
                    onMouseEnter={() => playHoverSound()}
                    className="zoom-btn"
                  >
                    -
                  </button>
                  <span className="zoom-value">{zoomLevel}%</span>
                  <button
                    onClick={() => { playClickSound(); setZoomLevel(Math.min(130, zoomLevel + 10)); }}
                    onMouseEnter={() => playHoverSound()}
                    className="zoom-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Scrollable Page Body representing actual PDF sheet */}
              <div className="doc-page-body-wrapper">
                <div
                  className="doc-page-sheet"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                >
                  <span className="sheet-watermark">EL ASCENSO DEL BARAJAS</span>
                  <h2 className="sheet-title">{DOCS_PAGES[currentDocPage].title}</h2>
                  <div className="sheet-divider" />
                  <div
                    className="sheet-content"
                    dangerouslySetInnerHTML={{ __html: DOCS_PAGES[currentDocPage].content }}
                  />
                  <div className="sheet-footer">
                    <span>Página {currentDocPage + 1} de {DOCS_PAGES.length}</span>
                    <span>Godot Engine 4.2</span>
                  </div>
                </div>
              </div>

              {/* Bottom Pagination controls */}
              <div className="doc-page-footer-nav">
                <button
                  onClick={() => { playClickSound(); setCurrentDocPage(Math.max(0, currentDocPage - 1)); }}
                  onMouseEnter={() => playHoverSound()}
                  className="btn-secondary pagination-btn"
                  disabled={currentDocPage === 0}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span className="page-indicator-text">
                  Pág. {currentDocPage + 1} / {DOCS_PAGES.length}
                </span>
                <button
                  onClick={() => { playClickSound(); setCurrentDocPage(Math.min(DOCS_PAGES.length - 1, currentDocPage + 1)); }}
                  onMouseEnter={() => playHoverSound()}
                  className="btn-secondary pagination-btn"
                  disabled={currentDocPage === DOCS_PAGES.length - 1}
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CREDITOS */}
      <section id="creditos" className="section bg-dark-secondary">
        <div className="bg-ambient-glow" style={{ top: '80%', left: '30%', width: '500px', height: '500px' }} />

        <div className="section-container max-w-small">
          <div className="section-header text-center">
            <h2 className="section-title">Créditos del Proyecto</h2>
            <div className="section-divider" />
            <p className="section-subtitle">
              Conoce las tecnologías y recursos involucrados en la creación de esta documentación y videojuego.
            </p>
          </div>

          <div className="credits-grid">
            <div className="credit-card glass-card">
              <div className="credit-icon-container">
                <Code className="credit-icon" />
              </div>
              <h3>Tecnología de Desarrollo</h3>
              <p>Desarrollado completamente en <strong>Godot Engine 4.2</strong> (Stable). Se implementaron patrones de desarrollo robustos y programación modular en GDScript.</p>
            </div>

            <div className="credit-card glass-card">
              <div className="credit-icon-container">
                <Gamepad2 className="credit-icon" />
              </div>
              <h3>Inspiración de Diseño</h3>
              <p>Clon basado en el popular juego roguelike de mazo de cartas <strong>Slay the Spire</strong> por Mega Crit Games. Todos los derechos del diseño original les pertenecen.</p>
            </div>

            <div className="credit-card glass-card">
              <div className="credit-icon-container">
                <ShieldCheck className="credit-icon" />
              </div>
              <h3>Objetivo Académico</h3>
              <p>Creado con el fin de demostrar la viabilidad y mejores prácticas de arquitectura en Godot: desacoplamiento por eventos, generación procedural sólida e interfaces responsivas.</p>
            </div>
          </div>

          {/* Footer Copyright block */}
          <footer className="footer-credits glass-card text-center">
            <p className="footer-copyright">
              © {new Date().getFullYear()} - El Ascenso del barajas. Creado por Jose Antonio Peñalver y Francisco José Madrid.
            </p>
          </footer>
        </div>
      </section>
    </>
  );
}

export default App;
