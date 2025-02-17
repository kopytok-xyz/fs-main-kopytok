export const func_mindConnectionsLeader = () => {
  // Создаем SVG контейнер
  const createSvgContainer = () => {
    let svg = document.getElementById('connection-svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('id', 'connection-svg');
      Object.assign(svg.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: '1',
      });
      document.body.insertBefore(svg, document.body.firstChild);
    }
    return svg;
  };

  // Функция для проверки видимости элемента
  const isElementVisible = (element: Element): boolean => {
    const style = window.getComputedStyle(element);
    return style.display !== 'none';
  };

  const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 992) return 'tablet';
    return 'pc';
  };

  // Функция для получения всех соединений
  const getConnections = () => {
    const connections: Array<{ from: Element; to: Element }> = [];
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
          if (target !== dot && isElementVisible(target)) {
            connections.push({ from: dot, to: target });
          }
        });
      });
    });

    return connections;
  };

  // Функция для отрисовки линий
  const drawLines = (svg: SVGElement, connections: Array<{ from: Element; to: Element }>) => {
    // Очищаем предыдущие линии
    svg.innerHTML = '';

    connections.forEach(({ from, to }) => {
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();

      // Создаем path элемент
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.classList.add('connection-line');

      // Вычисляем координаты с учетом прокрутки
      const x1 = fromRect.left + fromRect.width / 2 + window.scrollX;
      const y1 = fromRect.top + fromRect.height / 2 + window.scrollY;
      const x2 = toRect.left + toRect.width / 2 + window.scrollX;
      const y2 = toRect.top + toRect.height / 2 + window.scrollY;

      // Создаем путь для линии
      const d = `M ${x1} ${y1} L ${x2} ${y2}`;
      path.setAttribute('d', d);

      // Добавляем линию в SVG
      svg.appendChild(path);
    });
  };

  // Инициализация
  const init = () => {
    const svg = createSvgContainer();
    let connections = getConnections();

    if (connections.length > 0) {
      console.log('Найдены соединения:', connections.length);

      // Функция обновления линий
      const updateAllLines = () => {
        connections = getConnections(); // Обновляем список соединений
        drawLines(svg, connections);
        requestAnimationFrame(updateAllLines);
      };

      // Запускаем постоянное обновление
      requestAnimationFrame(updateAllLines);

      // Наблюдатель за изменениями в DOM
      const observer = new MutationObserver(() => {
        connections = getConnections();
      });

      // Настройки наблюдателя
      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
        characterData: true,
      });

      // Очистка при уничтожении
      return () => {
        observer.disconnect();
      };
    }
    console.log('Соединения не найдены');
  };

  init();
};
