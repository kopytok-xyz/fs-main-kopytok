export const func_mindConnectionsLeader = () => {
  // Если родительский контейнер является document.body, оставляем z-index -1, иначе используем 0
  const createSvgContainerIn = (parent: Element) => {
    let svg = parent.querySelector('#connection-svg') as SVGElement;
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('id', 'connection-svg');
      const zIndexValue = parent === document.body ? '-1' : '0';
      Object.assign(svg.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: zIndexValue,
      });
      parent.insertBefore(svg, parent.firstChild);
    }
    return svg;
  };

  const isElementVisible = (element: Element): boolean => {
    return window.getComputedStyle(element).display !== 'none';
  };

  const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 992) return 'tablet';
    return 'pc';
  };

  // Тип для хранения информации о соединении вместе с контейнером для отрисовки
  type Connection = { from: Element; to: Element; container: Element };

  const getConnections = (): Connection[] => {
    const connections: Connection[] = [];
    const deviceType = getDeviceType();
    const dots = document.querySelectorAll(`[dot-${deviceType}]`);

    dots.forEach((dot) => {
      if (!isElementVisible(dot)) return;

      const dotValue = dot.getAttribute(`dot-${deviceType}`);
      if (!dotValue) return;

      const targetNames = dotValue.split(',').map((name) => name.trim());
      targetNames.forEach((targetName) => {
        const targets = document.querySelectorAll(`[dot-${deviceType}="${targetName}"]`);
        targets.forEach((target) => {
          if (dot === target || !isElementVisible(target)) return;

          // Определяем, находится ли обе точки в одном табе
          const containerDot = dot.closest('.w-tab-pane');
          const containerTarget = target.closest('.w-tab-pane');

          let container: Element;
          if (containerDot && containerTarget && containerDot === containerTarget) {
            container = containerDot;
          } else {
            container = document.body;
          }
          connections.push({ from: dot, to: target, container });
        });
      });
    });

    return connections;
  };

  // Отрисовка линий для заданного SVG-контейнера с учётом его привязки
  const drawLines = (svg: SVGElement, connections: Array<{ from: Element; to: Element }>) => {
    // Очищаем предыдущие линии
    svg.innerHTML = '';

    const containerRect = svg.parentElement
      ? svg.parentElement.getBoundingClientRect()
      : { left: 0, top: 0 };

    connections.forEach(({ from, to }) => {
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();

      // Вычисляем координаты относительно родительского контейнера
      const x1 = fromRect.left - containerRect.left + fromRect.width / 2;
      const y1 = fromRect.top - containerRect.top + fromRect.height / 2;
      const x2 = toRect.left - containerRect.left + toRect.width / 2;
      const y2 = toRect.top - containerRect.top + toRect.height / 2;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.classList.add('connection-line');
      path.setAttribute('stroke', '#666666');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('fill', 'none');

      const d = `M ${x1} ${y1} L ${x2} ${y2}`;
      path.setAttribute('d', d);
      svg.appendChild(path);
    });
  };

  // Группируем соединения по их контейнеру и отрисовываем линии для каждой группы
  const updateAllLines = () => {
    const allConnections = getConnections();
    const groups = new Map<Element, Array<{ from: Element; to: Element }>>();

    allConnections.forEach((connection) => {
      if (!groups.has(connection.container)) {
        groups.set(connection.container, []);
      }
      groups.get(connection.container).push({ from: connection.from, to: connection.to });
    });

    groups.forEach((connections, container) => {
      const svg = createSvgContainerIn(container);
      drawLines(svg, connections);
    });

    requestAnimationFrame(updateAllLines);
  };

  const init = () => {
    const initialConnections = getConnections();
    if (initialConnections.length > 0) {
      console.log('Найдены соединения:', initialConnections.length);
      requestAnimationFrame(updateAllLines);

      const observer = new MutationObserver(() => {
        // Линии обновятся в следующем кадре при изменениях в DOM
      });
      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      });

      return () => {
        observer.disconnect();
      };
    }
    console.log('Соединения не найдены');
  };

  init();
};
