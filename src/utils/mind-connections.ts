export const func_mindConnections = () => {
  const all_mindDots = document.querySelectorAll('[mind-connection]');
  if (all_mindDots.length) {
    // Группируем элементы по значению атрибута 'mind-connection'
    const groups = {};
    all_mindDots.forEach((el) => {
      const key = el.getAttribute('mind-connection');
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(el);

      // Убедимся, что у элемента выше z-index, чем у SVG
      const computedStyle = window.getComputedStyle(el);
      if (computedStyle.position === 'static') {
        el.style.position = 'relative'; // Чтобы можно было задать z-index
      }
      el.style.zIndex = '2'; // Устанавливаем выше, чем у SVG
    });

    // Создаём SVG элемент для линий, если его нет
    let svg = document.getElementById('mind-connection-svg');
    if (!svg) {
      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('id', 'mind-connection-svg');
      svg.style.position = 'fixed';
      svg.style.top = '0';
      svg.style.left = '0';
      svg.style.width = '100%';
      svg.style.height = '100%';
      svg.style.pointerEvents = 'none';
      svg.style.zIndex = '1';
      svg.style.overflow = 'visible';

      // Обновляем viewBox при изменении размера окна
      const updateViewBox = () => {
        svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
      };
      window.addEventListener('resize', updateViewBox);
      updateViewBox();

      document.body.appendChild(svg);
    }

    // Храним линии для обновления позиций и анимации
    const lines = [];

    Object.values(groups).forEach((group) => {
      if (group.length >= 2) {
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const el1 = group[i];
            const el2 = group[j];

            // Проверяем видимость элементов
            const isVisible = (el) => {
              const style = window.getComputedStyle(el);
              return (
                style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
              );
            };

            if (!isVisible(el1) || !isVisible(el2)) continue;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('stroke', 'rgb(102, 102, 102)');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('vector-effect', 'non-scaling-stroke');

            const rect1 = el1.getBoundingClientRect();
            const rect2 = el2.getBoundingClientRect();

            // Проверяем валидность координат
            if (isNaN(rect1.left) || isNaN(rect1.top) || isNaN(rect2.left) || isNaN(rect2.top)) {
              continue;
            }

            const initialX = rect1.left + rect1.width / 2;
            const initialY = rect1.top + rect1.height / 2;

            line.setAttribute('x1', initialX.toString());
            line.setAttribute('y1', initialY.toString());
            line.setAttribute('x2', initialX.toString());
            line.setAttribute('y2', initialY.toString());

            svg.appendChild(line);
            lines.push({
              line,
              el1,
              el2,
              animated: false,
            });
          }
        }
      }
    });

    // Функция для анимации линии
    const animateLine = (lineObj) => {
      const { line, el1, el2 } = lineObj;
      const rect1 = el1.getBoundingClientRect();
      const rect2 = el2.getBoundingClientRect();

      const startX = rect1.left + rect1.width / 2;
      const startY = rect1.top + rect1.height / 2;
      const endX = rect2.left + rect2.width / 2;
      const endY = rect2.top + rect2.height / 2;

      const duration = 300;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;

        line.setAttribute('x2', currentX);
        line.setAttribute('y2', currentY);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // После завершения анимации устанавливаем конечные позиции
          line.setAttribute('x2', endX);
          line.setAttribute('y2', endY);
          lineObj.animated = true; // Отмечаем, что анимация завершена
        }
      };

      requestAnimationFrame(animate);
    };

    // Запускаем анимацию через 3.5 секунды после загрузки страницы
    setTimeout(() => {
      lines.forEach((lineObj) => {
        animateLine(lineObj);
      });
    }, 2500);

    // Функция для обновления позиций линий
    const updatePositions = () => {
      // Добавляем проверку на существование элементов
      lines.forEach(({ line, el1, el2, animated }) => {
        if (!document.body.contains(el1) || !document.body.contains(el2)) {
          line.remove();
          return;
        }

        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();

        // Проверяем валидность координат
        if (isNaN(rect1.left) || isNaN(rect1.top) || isNaN(rect2.left) || isNaN(rect2.top)) {
          return;
        }

        const x1 = rect1.left + rect1.width / 2;
        const y1 = rect1.top + rect1.height / 2;
        const x2 = rect2.left + rect2.width / 2;
        const y2 = rect2.top + rect2.height / 2;

        line.setAttribute('x1', x1.toString());
        line.setAttribute('y1', y1.toString());

        if (animated) {
          line.setAttribute('x2', x2.toString());
          line.setAttribute('y2', y2.toString());
        }
      });

      requestAnimationFrame(updatePositions);
    };

    // Начинаем обновление позиций
    updatePositions();
  }
};
