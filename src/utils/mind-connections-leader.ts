export const func_mindConnectionsLeader = () => {
  // Флаг для отладки. Если установить DEBUG = false, логов не будет.
  const DEBUG = true;
  // Интервал между логами по каждому ключу (в миллисекундах)
  const MIN_LOG_INTERVAL = 2000;
  const lastLogTimes: { [key: string]: number } = {};

  // Функция, которая выводит логи не чаще, чем раз в MIN_LOG_INTERVAL по каждому уникальному ключу.
  const logThrottled = (key: string, ...args: any[]) => {
    if (!DEBUG) return;
    const now = Date.now();
    if (!lastLogTimes[key] || now - lastLogTimes[key] >= MIN_LOG_INTERVAL) {
      lastLogTimes[key] = now;
    }
  };

  // Если родительский контейнер является document.body, оставляем z-index -1, иначе используем 0
  const createSvgContainerIn = (parent: Element) => {
    let svg = parent.querySelector('#connection-svg') as SVGElement;
    if (!svg) {
      logThrottled('createSvg', 'Создаем SVG-контейнер в родителе:', parent.tagName);
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
    const visible = window.getComputedStyle(element).display !== 'none';
    logThrottled('isVisible', `Элемент ${element.tagName} виден:`, visible);
    return visible;
  };

  const getDeviceType = () => {
    const width = window.innerWidth;
    logThrottled('deviceType', `Ширина окна: ${width}`);
    if (width < 768) return 'mobile';
    if (width < 992) return 'tablet';
    return 'pc';
  };

  // Новая версия функции getLineColor - теперь принимает контейнер
  const getLineColor = (container?: Element): string => {
    if (container) {
      // Ищем ближайшего родителя с атрибутом [dot-lines]
      const dotLinesAncestor = container.closest('[dot-lines]');
      if (dotLinesAncestor) {
        const attr = dotLinesAncestor.getAttribute('dot-lines');
        logThrottled('lineColor', 'Найден атрибут [dot-lines] в контейнере:', attr);
        const match = attr?.match(/#[0-9A-Fa-f]{6}/);
        if (match) {
          logThrottled('lineColor', 'Используем цвет линий:', match[0]);
          return match[0];
        }
      }
    }
    logThrottled('lineColor', 'Используем дефолтный цвет линий: #666666');
    return '#666666';
  };

  // Тип для хранения информации о соединении вместе с контейнером для отрисовки
  type Connection = { from: Element; to: Element; container: Element };

  const getConnections = (): Connection[] => {
    const connections: Connection[] = [];
    const deviceType = getDeviceType();
    logThrottled('getConnections', `Определенный тип устройства: ${deviceType}`);
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
          // Определяем, находятся ли обе точки в одном табе
          const containerDot = dot.closest('.w-tab-pane');
          const containerTarget = target.closest('.w-tab-pane');

          let container: Element;
          if (containerDot && containerTarget && containerDot === containerTarget) {
            container = containerDot;
          } else {
            container = document.body;
          }
          logThrottled(
            'connection',
            `Создано соединение: ${dot.tagName} -> ${target.tagName}, контейнер: ${container === document.body ? 'document.body' : 'w-tab-pane'}`
          );
          connections.push({ from: dot, to: target, container });
        });
      });
    });

    logThrottled('getConnections', `Найдено соединений: ${connections.length}`);
    return connections;
  };

  // Глобальная переменная для текущего стиля горизонтальных линий (grid, fluid или straight)
  let currentHorizontalLineStyle: 'grid' | 'fluid' | 'straight' = 'fluid';

  // Функция для вычисления L-образного пути с закругленным углом (стиль fluid) с увеличенным скруглением
  const computeFluidPath = (x1: number, y1: number, x2: number, y2: number): string => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Устанавливаем базовый радиус равный 20, но не больше, чем половина расстояния по соответствующей оси
    const r = Math.min(20, absDx / 2, absDy / 2);
    if (r <= 0) {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }

    // Определяем конечную точку горизонтального сегмента:
    // Если движение вправо, то доходим до x2 - r, если влево — до x2 + r
    const horizontalEndX = dx >= 0 ? x2 - r : x2 + r;

    // Определяем точку окончания дуги по вертикали:
    // Мы начинаем дугу от y1 и двигаемся на r вниз или вверх в зависимости от направления
    const signY = dy >= 0 ? 1 : -1;
    const arcEndY = y1 + r * signY;

    // Выбираем флаг sweep для дуги:
    // Если dx и dy имеют одинаковый знак (то есть движение вправо-вниз или влево-вверх), тогда sweepFlag = 1, иначе 0.
    const sweepFlag = (dx >= 0 && dy >= 0) || (dx < 0 && dy < 0) ? 1 : 0;

    return `M ${x1} ${y1} L ${horizontalEndX} ${y1} A ${r} ${r} 0 0 ${sweepFlag} ${x2} ${arcEndY} L ${x2} ${y2}`;
  };

  // Отрисовка линий. Для горизонтальных линий (если разница по X значимая)
  // применяется стиль, выбранный через hover, либо стандартный grid для устройств с шириной менее 992.
  const drawLines = (svg: SVGElement, connections: Array<{ from: Element; to: Element }>) => {
    logThrottled('drawLines', `Отрисовка линий, число соединений: ${connections.length}`);
    svg.innerHTML = '';
    const containerRect = svg.parentElement
      ? svg.parentElement.getBoundingClientRect()
      : { left: 0, top: 0 };
    const lineColor = getLineColor(svg.parentElement);
    connections.forEach(({ from, to }) => {
      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();
      const x1 = fromRect.left - containerRect.left + fromRect.width / 2;
      const y1 = fromRect.top - containerRect.top + fromRect.height / 2;
      const x2 = toRect.left - containerRect.left + toRect.width / 2;
      const y2 = toRect.top - containerRect.top + toRect.height / 2;
      let d: string;
      if (Math.abs(x2 - x1) < 1) {
        d = `M ${x1} ${y1} L ${x2} ${y2}`;
      } else {
        let style = currentHorizontalLineStyle;
        if (window.innerWidth < 992) {
          style = 'grid';
        }
        if (style === 'grid') {
          d = `M ${x1} ${y1} H ${x2} V ${y2}`;
        } else if (style === 'straight') {
          d = `M ${x1} ${y1} L ${x2} ${y2}`;
        } else if (style === 'fluid') {
          d = computeFluidPath(x1, y1, x2, y2);
        } else {
          d = `M ${x1} ${y1} H ${x2} V ${y2}`;
        }
      }
      logThrottled('drawLine', 'Отрисовываем линию с координатами:', d);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.classList.add('connection-line');
      path.style.setProperty('stroke', lineColor, 'important');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('fill', 'none');
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
      groups.get(connection.container)!.push({ from: connection.from, to: connection.to });
    });

    groups.forEach((connections, container) => {
      const svg = createSvgContainerIn(container);
      logThrottled(
        'updateContainer',
        `Отрисовка линий в контейнере: ${container === document.body ? 'document.body' : 'w-tab-pane'}, соединений: ${connections.length}`
      );
      drawLines(svg, connections);
    });

    requestAnimationFrame(updateAllLines);
  };

  // При наведении на элемент с [hover-lines-changer] устанавливаем новый стиль горизонтальных линий.
  const addHoverListeners = () => {
    const hoverElements = document.querySelectorAll('[hover-lines-changer]');
    hoverElements.forEach((element) => {
      element.addEventListener('mouseenter', onHover);
    });
  };

  const onHover = (event: Event) => {
    if (window.innerWidth < 992) return;
    const target = event.currentTarget as HTMLElement;
    let newStyle = target.getAttribute('hover-lines-changer');
    if (newStyle) {
      newStyle = newStyle.trim().toLowerCase();
      if (['fluid', 'straight', 'grid'].includes(newStyle)) {
        currentHorizontalLineStyle = newStyle as 'fluid' | 'straight' | 'grid';
      }
    }
  };

  const init = () => {
    logThrottled('init', 'Инициализация соединений');
    const initialConnections = getConnections();
    logThrottled('init', 'Начальное число соединений:', initialConnections.length);
    if (initialConnections.length > 0) {
      logThrottled('init', 'Запуск обновления линий');
      requestAnimationFrame(updateAllLines);
      addHoverListeners();

      const observer = new MutationObserver(() => {
        logThrottled('observer', 'Обнаружены изменения в DOM, обновляем линии');
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
    logThrottled('init', 'Соединения не найдены');
  };

  init();
};
