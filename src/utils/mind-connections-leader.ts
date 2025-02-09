export const func_mindConnectionsLeader = () => {
  // Задержка запуска скрипта на 2.5 секунды
  setTimeout(() => {
    let currentLineStyleIndex = 1; // Индекс текущего стиля линии ('grid')
    const lineStyles = ['straight', 'grid', 'curved']; // Массив стилей линий
    const connectionsData = []; // Для хранения данных о соединениях
    const breakpoints = [480, 769, 992]; // Контрольные точки разрешений
    let previousWindowWidth = window.innerWidth; // Предыдущая ширина окна
    let shouldUpdateLines = true; // Флаг для контроля обновления линий

    // Добавляем переменную для отслеживания таймаута
    let resizeTimeout = null;

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
        // Добавим проверку и установку opacity для точек соединения
        if (startEl.classList.contains('connection-dot')) {
          startEl.style.opacity = '1';
        }

        const targetSelectors = startEl.getAttribute('mind-connection').split(',');

        targetSelectors.forEach((targetSelector) => {
          const trimmedSelector = targetSelector.trim();
          const endEl = document.querySelector(`[mind-connection="${trimmedSelector}"]`);

          if (!endEl) return;

          // Проверяем и устанавливаем opacity для конечной точки
          if (endEl.classList.contains('connection-dot')) {
            endEl.style.opacity = '1';
          }

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

      setTimeout(() => {
        document.querySelectorAll('.connection-dot').forEach((dot) => {
          dot.style.opacity = '1';
          // Добавим плавный переход
          dot.style.transition = 'opacity 0.3s ease';
        });
      }, 100); // Небольшая задержка для уверенности, что все соединения отрисованы
    }

    // Оптимизируем функцию updateLine
    function updateLine(connection) {
      const { startEl, endEl, pathElement } = connection;
      const startRect = startEl.getBoundingClientRect();
      const endRect = endEl.getBoundingClientRect();

      const x1 = startRect.left + startRect.width / 2 + window.scrollX;
      const y1 = startRect.top + startRect.height / 2 + window.scrollY;
      const x2 = endRect.left + endRect.width / 2 + window.scrollX;
      const y2 = endRect.top + endRect.height / 2 + window.scrollY;

      // Просто обновляем путь без анимации при ресайзе
      const path = `M ${x1} ${y1} L ${x2} ${y2}`;
      pathElement.setAttribute('d', path);
    }

    // Оптимизируем функцию updateAllLines
    function updateAllLines() {
      if (!shouldUpdateLines || document.hidden) return;

      connectionsData.forEach((connection) => {
        const startElVisible = connection.startEl.offsetParent !== null;
        const endElVisible = connection.endEl.offsetParent !== null;

        if (startElVisible && endElVisible) {
          updateLine(connection);
        }
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

    // Добавляем дебаунс для обработки ресайза
    window.addEventListener('resize', () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      shouldUpdateLines = false; // Останавливаем обновления на время ресайза

      resizeTimeout = setTimeout(() => {
        const currentWidth = window.innerWidth;
        // Проверяем, действительно ли изменилась ширина
        if (currentWidth !== previousWindowWidth) {
          previousWindowWidth = currentWidth;
          shouldUpdateLines = true;
          // Обновляем все линии разом после окончания ресайза
          connectionsData.forEach((connection) => {
            updateLine(connection);
          });
        }
      }, 150); // Задержка в 150мс после последнего события ресайза
    });

    // Наблюдатель за изменениями в DOM
    const observer = new MutationObserver((mutations) => {
      // Проверяем, затрагивают ли изменения наши элементы
      const shouldUpdate = mutations.some((mutation) => {
        return connectionsData.some(
          (connection) =>
            mutation.target.contains(connection.startEl) ||
            mutation.target.contains(connection.endEl)
        );
      });

      if (shouldUpdate) {
        connectionsData.forEach((connection) => {
          const startElVisible = connection.startEl.offsetParent !== null;
          const endElVisible = connection.endEl.offsetParent !== null;

          if (startElVisible && endElVisible) {
            updateLine(connection);
          }
        });
      }
    });

    // Изменяем настройки наблюдателя для оптимизации
    const config = {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true,
      attributeFilter: ['style', 'class'], // Следим только за relevant атрибутами
    };

    // Начинаем наблюдение за документом
    observer.observe(document.body, config);

    // Удаляем этот блок, чтобы отключить переключение стиля линий по интервалу
    // setInterval(() => {
    //   toggleLineStyle();
    // }, 10000);
  }, 2500);
};
