export const func_mindConnectionsLeader = () => {
  // Задержка запуска скрипта на 2.5 секунды
  setTimeout(() => {
    let currentLineStyleIndex = 1; // Индекс текущего стиля линии ('grid')
    const lineStyles = ['straight', 'grid', 'curved']; // Массив стилей линий
    const connectionsData = []; // Для хранения данных о соединениях
    const breakpoints = [480, 769, 992]; // Контрольные точки разрешений
    let previousWindowWidth = window.innerWidth; // Предыдущая ширина окна
    let shouldUpdateLines = true; // Флаг для контроля обновления линий

    // Функция для отрисовки всех соединений
    function drawConnections() {
      // Если SVG еще не создан, создаем его
      let svg = document.getElementById('connection-svg');
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('id', 'connection-svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none'; // Чтобы SVG не перекрывал другие элементы
        svg.style.overflow = 'visible'; // Чтобы линии не обрезались
        svg.style.zIndex = '-1'; // Устанавливаем отрицательный z-index для SVG
        // Вставляем SVG перед первым элементом body, чтобы линии были за элементами
        document.body.insertBefore(svg, document.body.firstChild);
      }

      const connections = document.querySelectorAll('[mind-connection]');

      // Задайте толщину и цвет линии
      const lineThickness = 1; // Ваша изначальная толщина
      const lineColor = '#666666'; // Цвет линий

      connections.forEach((startEl) => {
        const targetSelectors = startEl.getAttribute('mind-connection').split(',');

        targetSelectors.forEach((targetSelector) => {
          const trimmedSelector = targetSelector.trim();
          const endEl = document.querySelector(`[mind-connection="${trimmedSelector}"]`);

          if (!endEl) return;

          // Проверяем, нужно ли пропустить отрисовку линии на мобильных устройствах
          const isMobile = window.innerWidth < 768;
          const startElHiddenOnMobile = startEl.classList.contains('hide-on-mobile');
          const endElHiddenOnMobile = endEl.classList.contains('hide-on-mobile');

          if (isMobile && (startElHiddenOnMobile || endElHiddenOnMobile)) {
            // Если условие выполняется, пропускаем отрисовку этой линии
            return;
          }

          const isHorizontalAttr = startEl.getAttribute('data-start-horizontal');
          const isHorizontalStart =
            isHorizontalAttr !== null ? (isHorizontalAttr === 'true' ? true : false) : null;

          // Ищем существующие данные о линии между этими элементами
          let connection = connectionsData.find(
            (data) => data.startEl === startEl && data.endEl === endEl
          );

          if (!connection) {
            // Если соединения еще нет, создаем новое
            const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathElement.setAttribute('stroke', lineColor);
            pathElement.setAttribute('stroke-width', lineThickness);
            pathElement.setAttribute('fill', 'none');
            pathElement.classList.add('connection-line');
            svg.appendChild(pathElement);

            connection = {
              startEl,
              endEl,
              pathElement,
              isHorizontalStart,
            };
            connectionsData.push(connection);
          }

          // Обновляем позицию линии
          updateLine(connection);
        });
      });
    }

    // Функция для обновления линии
    function updateLine(connection) {
      const { startEl, endEl, pathElement, isHorizontalStart } = connection;
      const startRect = startEl.getBoundingClientRect();
      const endRect = endEl.getBoundingClientRect();

      const x1 = startRect.left + startRect.width / 2 + window.scrollX;
      const y1 = startRect.top + startRect.height / 2 + window.scrollY;
      const x2 = endRect.left + endRect.width / 2 + window.scrollX;
      const y2 = endRect.top + endRect.height / 2 + window.scrollY;

      let path;
      const currentLineStyle = lineStyles[currentLineStyleIndex];

      if (currentLineStyle === 'straight') {
        // Прямая линия
        path = `M ${x1} ${y1} L ${x2} ${y2}`;
      } else if (currentLineStyle === 'curved') {
        // Плавная кривая (используем ваш оригинальный код)
        const dx = (x2 - x1) / 2;
        const dy = (y2 - y1) / 2;
        path = `M ${x1} ${y1} Q ${x1} ${y1 + dy}, ${x1 + dx} ${y1 + dy} T ${x2} ${y2}`;
      } else if (currentLineStyle === 'grid') {
        // Ломаная линия с углами
        if (isHorizontalStart === null) {
          // Если направление не указано, рисуем прямую линию
          path = `M ${x1} ${y1} L ${x2} ${y2}`;
        } else if (isHorizontalStart) {
          // Горизонтальное начало
          path = `M ${x1} ${y1} H ${x2} V ${y2}`;
        } else {
          // Вертикальное начало
          path = `M ${x1} ${y1} V ${y2} H ${x2}`;
        }
      }

      const previousPath = pathElement.getAttribute('d');
      if (previousPath !== path) {
        // Анимируем переход между путями
        pathElement.animate([{ d: previousPath }, { d: path }], {
          duration: 1000,
          fill: 'forwards',
        });
        pathElement.setAttribute('d', path);
      }
    }

    // Функция для обновления всех линий (используется для анимации)
    function updateAllLines() {
      if (!shouldUpdateLines) return;
      connectionsData.forEach((connection) => {
        updateLine(connection);
      });
      requestAnimationFrame(updateAllLines);
    }

    // Функция для установки стиля линий
    function setLineStyle(styleName) {
      const index = lineStyles.indexOf(styleName);
      if (index !== -1) {
        currentLineStyleIndex = index;
        // Перерисовываем линии
        connectionsData.forEach((connection) => {
          updateLine(connection);
        });
      }
    }

    // Обработчики наведения
    function addHoverListeners() {
      const hoverElements = document.querySelectorAll('[hover-lines-changer]');
      hoverElements.forEach((element) => {
        element.addEventListener('mouseenter', onHover);
        // Не добавляем обработчик 'mouseleave', так как эффект должен сохраняться
      });
    }

    function onHover(event) {
      if (window.innerWidth >= 768) {
        const element = event.currentTarget;
        const newLineStyle = element.getAttribute('hover-lines-changer');
        if (['straight', 'grid', 'fluid', 'curved'].includes(newLineStyle)) {
          const styleName = newLineStyle === 'fluid' ? 'curved' : newLineStyle;
          setLineStyle(styleName);
        }
      }
    }

    // Функция для перезапуска скрипта
    function restartScript() {
      // Удаляем SVG элемент
      const svg = document.getElementById('connection-svg');
      if (svg) {
        svg.parentNode.removeChild(svg);
      }

      // Очищаем данные о соединениях
      connectionsData.length = 0;

      // Останавливаем обновление линий
      shouldUpdateLines = false;

      // Ждем 1 секунду и запускаем скрипт заново
      setTimeout(() => {
        previousWindowWidth = window.innerWidth; // Обновляем ширину окна
        shouldUpdateLines = true;
        drawConnections();
        addHoverListeners();
      }, 1000);
    }

    // Первая отрисовка
    drawConnections();
    // Запускаем обновление линий
    requestAnimationFrame(updateAllLines);
    // Добавляем обработчики наведения
    addHoverListeners();

    // Перерисовка при изменении размера окна
    window.addEventListener('resize', () => {
      // Используем debounce, чтобы не вызывать функцию слишком часто
      clearTimeout(window.resizeTimeout);
      window.resizeTimeout = setTimeout(() => {
        handleResize();
      }, 100);
    });

    function handleResize() {
      const currentWindowWidth = window.innerWidth;

      // Проверяем, пересекли ли мы какую-либо из контрольных точек
      let crossedBreakpoint = false;

      for (const breakpoint of breakpoints) {
        if (
          (previousWindowWidth < breakpoint && currentWindowWidth >= breakpoint) ||
          (previousWindowWidth >= breakpoint && currentWindowWidth < breakpoint)
        ) {
          crossedBreakpoint = true;
          break;
        }
      }

      if (crossedBreakpoint) {
        // Перезапускаем скрипт
        restartScript();
      } else {
        // Просто перерисовываем соединения
        drawConnections();
      }

      previousWindowWidth = currentWindowWidth;
    }

    // Наблюдатель за изменениями в DOM
    const observer = new MutationObserver(() => {
      connectionsData.forEach((connection) => {
        updateLine(connection);
      });
    });

    // Настройки наблюдателя
    const config = { attributes: true, childList: true, subtree: true, characterData: true };

    // Начинаем наблюдение за документом
    observer.observe(document.body, config);

    // Удаляем этот блок, чтобы отключить переключение стиля линий по интервалу
    // setInterval(() => {
    //   toggleLineStyle();
    // }, 10000);
  }, 2500);
};
