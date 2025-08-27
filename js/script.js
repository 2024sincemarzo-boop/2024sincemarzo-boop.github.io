
    /* Fondo partículas */
    particlesJS("particles-js", {
      particles: {
        number: { value: 100 },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.6 },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 300, color: "#ffffff", opacity: 0.4, width: 1 },
        move: { enable: true, speed: 4 }
      },
      interactivity: { events: { onhover: { enable: false } } },
      retina_detect: true
    });

    document.addEventListener('DOMContentLoaded', () => {
      const hubs = document.querySelectorAll('.hub');
      const scene = document.getElementById('scene');
      const overlay = document.getElementById('overlay');
      const infoCard = document.querySelector('.info-card');

      /* ====== Contenido de paneles por hub ====== */
      const info = {
        hub1: [
          `<h2>QR Malos (1/3)</h2><p>Introducción sobre QR peligrosos.</p>`,
          `<h2>QR Malos (2/3)</h2><p>Cómo afectan los sistemas.</p>`,
          `<h2>QR Malos (3/3)</h2><p>Cómo prevenirlos.</p><button id="startGameBtn">Poner a prueba</button>`
        ],
        hub2: [
          `<h2>Links Erróneos (1/3)</h2><p>Concepto.</p>`,
          `<h2>Links Erróneos (2/3)</h2><p>Ejemplos comunes.</p>`,
          `<h2>Links Erróneos (3/3)</h2><p>Prevención.</p><button id="startGameBtn">Poner a prueba</button>`
        ],
        hub3: [
          `<h2>Páginas Falsas (1/3)</h2><p>Introducción.</p>`,
          `<h2>Páginas Falsas (2/3)</h2><p>Señales de alerta.</p>`,
          `<h2>Páginas Falsas (3/3)</h2><p>Qué hacer.</p><button id="startGameBtn">Poner a prueba</button>`
        ],
        hub4: [
          `<h2>Más Cosas Malas (1/3)</h2><p>Resumen.</p>`,
          `<h2>Más Cosas Malas (2/3)</h2><p>Caso de estudio.</p>`,
          `<h2>Más Cosas Malas (3/3)</h2><p>Conclusión.</p><button id="startGameBtn">Poner a prueba</button>`
        ]
      };

      /* ====== Árboles de decisiones (puedes editar textos y ramificaciones) ====== */
      const TREES = {
        hub1: { // QR malos
          question: "Ves un QR pegado en una mesa de restaurante. ¿Qué haces?",
          options: [
            {
              text: "Lo escaneo directo",
              result: { ok: false, why: "El QR te lleva a una web falsa que pide tus credenciales. Riesgo de phishing." }
            },
            {
              text: "Primero reviso la URL de destino",
              next: {
                question: "La URL es 'banc0-seguro.com' (con un cero). ¿Qué haces?",
                options: [
                  {
                    text: "Confío, se parece al banco",
                    result: { ok: false, why: "Es typosquatting. Cambian letras para engañar (0 por o)." }
                  },
                  {
                    text: "No entro y reporto el QR",
                    result: { ok: true,  why: "Perfecto. Sospechaste y evitaste el fraude." }
                  }
                ]
              }
            }
          ]
        },
        hub2: { // Links erróneos
          question: "Te llega un link por correo de un 'proveedor'. ¿Qué haces?",
          options: [
            {
              text: "Abro y descargo el archivo adjunto",
              result: { ok: false, why: "Podría ser malware. Nunca abras adjuntos inesperados." }
            },
            {
              text: "Verifico el dominio y DKIM/SPF",
              next: {
                question: "El dominio es parecido y el mensaje pide urgencia. ¿Qué haces?",
                options: [
                  { text: "Respondo con datos de acceso", result: { ok: false, why: "Nunca compartas credenciales por email." } },
                  { text: "Confirmo por otro canal",       result: { ok: true,  why: "Verificación por otro canal evita fraudes." } }
                ]
              }
            }
          ]
        },
        hub3: { // Páginas falsas
          question: "Llegas a una web de login con diseño familiar. ¿Qué haces?",
          options: [
            { text: "Pongo mi usuario y contraseña", result: { ok: false, why: "Pudo ser una web clon. Verifica HTTPS y dominio." } },
            {
              text: "Chequeo el certificado y candado",
              next: {
                question: "El certificado es válido, pero el dominio es raro. ¿Qué haces?",
                options: [
                  { text: "Sigo adelante",     result: { ok: false, why: "Certificado válido no garantiza legitimidad del sitio." } },
                  { text: "Cierro y busco el sitio oficial", result: { ok: true, why: "Navegar directo al dominio oficial es más seguro." } }
                ]
              }
            }
          ]
        },
        hub4: { // Más cosas
          question: "Un USB aparece en la oficina etiquetado 'Planillas'. ¿Qué haces?",
          options: [
            { text: "Lo conecto para revisar", result: { ok: false, why: "Riesgo de BadUSB. Podría ejecutar código malicioso." } },
            {
              text: "Lo entrego a TI",
              next: {
                question: "TI indica que puede estar comprometido. ¿Qué haces?",
                options: [
                  { text: "Lo uso igual", result: { ok: false, why: "Ignorar políticas de TI aumenta el riesgo." } },
                  { text: "Lo descarto según protocolo", result: { ok: true, why: "Acción correcta según procedimiento." } }
                ]
              }
            }
          ]
        }
      };

      let activeHub = null, activeKey = null, currentIndex = 0;

      overlay.addEventListener('click', (e) => e.stopPropagation());

      hubs.forEach(hub => {
        hub.addEventListener('click', e => {
          e.stopPropagation();

          if (activeHub === hub) { resetView(); return; }
          if (activeHub) activeHub.classList.remove('active', 'hidden');
          hub.classList.add('active');
          setTimeout(() => hub.classList.add('hidden'), 500);

          activeHub = hub;
          activeKey = [...hub.classList].find(c => /^hub\d+$/.test(c));
          currentIndex = 0;

          // Zoom al nodo
          const rect = hub.getBoundingClientRect();
          const nodeCenterX = rect.left + rect.width / 2;
          const nodeCenterY = rect.top + rect.height / 2;
          const offsetX = window.innerWidth / 2 - nodeCenterX;
          const offsetY = window.innerHeight / 2 - nodeCenterY;
          scene.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(2)`;

          renderPanel();
          overlay.classList.add('active');
          infoCard.style.opacity = 0;
        });
      });

      function renderPanel() {
        overlay.innerHTML = `
          <div class="panel">
            ${info[activeKey][currentIndex]}
            <div class="controls">
              <button id="prevBtn" ${currentIndex === 0 ? "disabled" : ""}>Anterior</button>
              <button id="nextBtn" ${currentIndex === info[activeKey].length - 1 ? "disabled" : ""}>Siguiente</button>
            </div>
          </div>
        `;

        const panel = overlay.querySelector('.panel');
        requestAnimationFrame(() => panel.classList.add('in'));

        const prevBtn = overlay.querySelector('#prevBtn');
        const nextBtn = overlay.querySelector('#nextBtn');
        prevBtn.addEventListener('click', (e) => { e.stopPropagation(); if (currentIndex > 0) { currentIndex--; renderPanel(); } });
        nextBtn.addEventListener('click', (e) => { e.stopPropagation(); if (currentIndex < info[activeKey].length - 1) { currentIndex++; renderPanel(); } });

        // Botón de juego
        const gameBtn = overlay.querySelector('#startGameBtn');
        if (gameBtn) {
          gameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startDecisionGame(activeKey);
          });
        }

        overlay.querySelectorAll('button,a').forEach(el => el.addEventListener('click', ev => ev.stopPropagation()));
      }

      /* ====== Juego tipo árbol ====== */
      function startDecisionGame(topicKey) {
        const tree = TREES[topicKey] || TREES.hub1;

        overlay.innerHTML = `
          <div class="panel in">
            <h2>Decisión interactiva</h2>
            <div class="game-wrap card-base">
              <div class="game-canvas">
                <svg class="tree-svg" xmlns="http://www.w3.org/2000/svg"></svg>
                <div class="nodes-layer"></div>
              </div>
            </div>
            <div class="controls">
              <button id="exitGame">Salir</button>
              <div style="flex:1"></div>
              <button id="restartGame">Reiniciar</button>
            </div>
          </div>
        `;

        const gameWrap = overlay.querySelector('.game-wrap');
        const canvas   = overlay.querySelector('.game-canvas');
        const svg      = overlay.querySelector('.tree-svg');
        const nodesLay = overlay.querySelector('.nodes-layer');

        let depth = 0;                 // nivel actual (fila)
        const rowGap = 200;            // distancia vertical entre filas
        const baseY = 24;              // margen superior
        const nodesByDepth = [];       // guardamos nodos DOM por nivel para limpiar ramas
        const centers = [50, 30, 70, 30, 70]; // posiciones X en % por fila

        // Ajustar altura dinámica del lienzo
        function ensureHeightFor(d) {
          const needed = baseY + (d+2) * rowGap;
          svg.style.height = needed + "px";
          nodesLay.style.height = needed + "px";
        }
        function pctXToPx(percent) {
          const w = nodesLay.clientWidth;
          return (w * percent) / 100;
        }
        function yForRow(r) { return baseY + r*rowGap; }

        // Dibuja línea con animación simple
        function drawLink(x1, y1, x2, y2) {
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", x1);
          line.setAttribute("y1", y1);
          line.setAttribute("x2", x1);
          line.setAttribute("y2", y1);
          line.setAttribute("stroke", "rgba(255,255,255,0.35)");
          line.setAttribute("stroke-width", "2");
          svg.appendChild(line);
          // animar hasta destino
          setTimeout(() => {
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
          }, 20);
        }

        // Crea un nodo visual
        function makeNode({ text, xPct, row, klass = "", clickable = false, onClick }) {
          ensureHeightFor(row);
          const node = document.createElement("div");
          node.className = `glass-node ${klass}`;
          node.textContent = text;
          const xpx = pctXToPx(xPct) - 80; // centrado (160px/2)
          const ypx = yForRow(row) - 80;
          node.style.left = `${xpx}px`;
          node.style.top  = `${ypx}px`;
          if (clickable) {
            node.addEventListener("click", (e) => {
              e.stopPropagation();
              onClick && onClick();
            });
          } else {
            node.classList.add("disabled");
          }
          nodesLay.appendChild(node);
          (nodesByDepth[row] ||= []).push(node);
          return { node, cx: xpx+80, cy: ypx+80 };
        }

        // Limpia niveles > row (cuando se cambia de rama)
        function clearBelow(row) {
          for (let r = row+1; r < nodesByDepth.length; r++) {
            (nodesByDepth[r] || []).forEach(n => n.remove());
            nodesByDepth[r] = [];
          }
          // También podemos limpiar líneas sobrantes (simple: regenerar svg desde 0)
          const keepUntilY = yForRow(row) + 5;
          [...svg.querySelectorAll("line")].forEach(L => {
            const y2 = +L.getAttribute("y2");
            if (y2 > keepUntilY) L.remove();
          });
        }

        // Pequeño "pan/zoom" hacia el nivel
        function focusRow(row) {
          const shift = Math.max(0, (row-1) * 80);
          canvas.style.transform = `translateY(-${shift}px) scale(1.02)`;
          setTimeout(() => { canvas.style.transform = `translateY(-${shift}px) scale(1)`; }, 320);
        }

        // Render recursivo
        function renderNode(nodeData, row, parentPos) {
          focusRow(row);
          // Root o siguiente pregunta
          const xPct = (row === 0) ? 50 : 50; // pregunta centrada siempre
          const q = makeNode({ text: nodeData.question, xPct, row, klass: "question", clickable: false });
          if (parentPos) { drawLink(parentPos.cx, parentPos.cy, q.cx, q.cy); }

          // Mostrar opciones con delay para efecto de “aparecer”
          setTimeout(() => {
            const opts = nodeData.options || [];
            const leftX  = 30, rightX = 70;
            // Dos opciones: izquierda/derecha
            const left = makeNode({
              text: opts[0].text, xPct: leftX, row: row+1, klass: "option", clickable: true,
              onClick: () => handleChoice(opts[0], row+1, q)
            });
            const right = makeNode({
              text: opts[1].text, xPct: rightX, row: row+1, klass: "option", clickable: true,
              onClick: () => handleChoice(opts[1], row+1, q)
            });
            drawLink(q.cx, q.cy, left.cx, left.cy);
            drawLink(q.cx, q.cy, right.cx, right.cy);
          }, 250);
        }

        function showResult(res, fromRow) {
          // Tarjeta de resultado debajo del último nivel visible
          const container = document.createElement("div");
          container.className = `result-card ${res.ok ? "good" : "bad"}`;
          container.innerHTML = `
            <strong>${res.ok ? "✅ ¡Bien hecho!" : "❌ Oops"}</strong>
            <div style="margin-top:6px;">${res.why}</div>
          `;
          overlay.querySelector(".panel").appendChild(container);
        }

        function handleChoice(choice, row, parentQ) {
          // Cambiar de rama: borra niveles inferiores y líneas
          clearBelow(row-1);
          focusRow(row);
          // Si hoja -> resultado
          if (choice.result) {
            showResult(choice.result, row);
            return;
          }
          // Si hay siguiente pregunta -> render
          if (choice.next) {
            renderNode(choice.next, row, { cx: pctXToPx(50), cy: yForRow(row)-80 }); // desde centro de la fila previa
          }
        }

        // Inicio: render raíz
        renderNode(tree, 0, null);

        // Controles
        overlay.querySelector("#exitGame").addEventListener("click", (e) => { e.stopPropagation(); resetView(); });
        overlay.querySelector("#restartGame").addEventListener("click", (e) => {
          e.stopPropagation();
          startDecisionGame(topicKey);
        });
      }

      /* ====== Cerrar overlay si clic afuera ====== */
      document.addEventListener('click', (e) => {
        const clickedInsideOverlay = e.target.closest('.overlay');
        const clickedHub = e.target.closest('.hub');
        if (activeHub && !clickedInsideOverlay && !clickedHub) resetView();
      });

      function resetView() {
        if (activeHub) activeHub.classList.remove('active', 'hidden');
        activeHub = null; activeKey = null; currentIndex = 0;
        scene.style.transform = 'scale(1) translate(0,0)';
        overlay.classList.remove('active');
        infoCard.style.opacity = 1;
      }
    });
 