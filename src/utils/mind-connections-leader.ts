export const func_mindConnectionsLeader = () => {
  let lastDrawTimeout: NodeJS.Timeout | null = null;
  const lines: LeaderLine[] = [];
  const shouldUpdateLines = true;

  const createCustomGridPath = (startEl: Element, endEl: Element, isHorizontal: boolean) => {
    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();

    const x1 = startRect.left + startRect.width / 2 + window.scrollX;
    const y1 = startRect.top + startRect.height / 2 + window.scrollY;
    const x2 = endRect.left + endRect.width / 2 + window.scrollX;
    const y2 = endRect.top + endRect.height / 2 + window.scrollY;

    if (isHorizontal) {
      return `M ${x1} ${y1} H ${x2} V ${y2}`;
    }
    return `M ${x1} ${y1} V ${y2} H ${x2}`;
  };

  // Добавляем стили линий
  const lineStyles = {
    straight: {
      path: 'straight',
      size: 1,
      startPlug: 'behind',
      endPlug: 'behind',
    },
    curved: {
      path: 'fluid',
      size: 1,
      startPlug: 'behind',
      endPlug: 'behind',
    },
    grid: {
      path: 'fluid',
      size: 1,
      startPlug: 'behind',
      endPlug: 'behind',
      color: '#666666',
      dropShadow: false,
      gradient: false,
      endPlugOutline: false,
      startPlugOutline: false,
      path: (startEl, endEl) => {
        const isHorizontal = startEl.getAttribute('data-start-horizontal') === 'true';
        return createCustomGridPath(startEl, endEl, isHorizontal);
      },
    },
  };

  const updateAllLines = () => {
    if (!shouldUpdateLines) return;
    lines.forEach((line) => line.position());
    requestAnimationFrame(updateAllLines);
  };

  const setLineStyle = (line: LeaderLine, styleName: string) => {
    const style = lineStyles[styleName] || lineStyles.straight;
    Object.assign(line, style);
    line.position();
  };

  const drawConnections = (isRetry = false) => {
    lines.forEach((line) => line.remove());
    lines.length = 0;

    const dots = document.querySelectorAll('[mind-connection-new]');
    const dotsMap = new Map();

    dots.forEach((dot) => {
      const value = dot.getAttribute('mind-connection-new');
      if (!value) return;

      const style = window.getComputedStyle(dot);
      if (style.display === 'none') return;

      const values = value.split(',').map((v) => v.trim());

      values.forEach((singleValue) => {
        if (!dotsMap.has(singleValue)) {
          dotsMap.set(singleValue, []);
        }
        dotsMap.get(singleValue).push(dot);
      });
    });

    dotsMap.forEach((dots, value) => {
      if (dots.length === 2) {
        console.log(`Создаю соединение для значения: ${value}`);
        const lineStyle = dots[0].getAttribute('line-style') || 'straight';
        const style = lineStyles[lineStyle];

        // Определяем направление первого отрезка
        const isHorizontal = dots[0].getAttribute('data-start-horizontal') === 'true';

        const line = new LeaderLine(dots[0], dots[1], {
          color: '#666666',
          size: 1,
          ...style,
          elementAnchor: 'center',
          startPlug: 'behind',
          endPlug: 'behind',
          // Устанавливаем sockets в зависимости от направления
          startSocket: isHorizontal ? 'right' : 'bottom',
          endSocket: isHorizontal ? 'left' : 'top',
        });
        lines.push(line);

        // Добавляем обработчики наведения для изменения стиля
        dots.forEach((dot) => {
          const hoverStyle = dot.getAttribute('hover-line-style');
          if (hoverStyle) {
            dot.addEventListener('mouseenter', () => {
              if (window.innerWidth >= 768) {
                // Проверка для мобильных устройств
                setLineStyle(line, hoverStyle);
              }
            });
          }
        });
      }
    });

    if (!isRetry) {
      if (lastDrawTimeout) {
        clearTimeout(lastDrawTimeout);
      }
      lastDrawTimeout = setTimeout(() => {
        drawConnections(true);
        lastDrawTimeout = null;
      }, 300);
    }
  };

  drawConnections();
  requestAnimationFrame(updateAllLines);
  window.addEventListener('resize', () => drawConnections());
};
