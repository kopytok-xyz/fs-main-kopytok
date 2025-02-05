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
      svg.style.pointerEvents = 'none'; // Чтобы не блокировал клики
      svg.style.zIndex = '1'; // Устанавливаем ниже, чем у элементов
      document.body.appendChild(svg);
    }

    // Храним линии для обновления позиций и анимации
    const lines = [];

    Object.values(groups).forEach((group) => {
      if (group.length >= 2) {
        // Соединяем каждый элемент с каждым другим в группе
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            const el1 = group[i];
            const el2 = group[j];

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('stroke', 'rgb(102, 102, 102)'); // Серый цвет
            line.setAttribute('stroke-width', '1');
            // Изначально линия имеет нулевую длину (точка)
            const rect1 = el1.getBoundingClientRect();
            const rect2 = el2.getBoundingClientRect();
            const initialX = rect1.left + rect1.width / 2;
            const initialY = rect1.top + rect1.height / 2;
            line.setAttribute('x1', initialX);
            line.setAttribute('y1', initialY);
            line.setAttribute('x2', initialX);
            line.setAttribute('y2', initialY);
            svg.appendChild(line);
            lines.push({
              line,
              el1,
              el2,
              animated: false, // Флаг для отслеживания анимации
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
      lines.forEach(({ line, el1, el2, animated }) => {
        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();

        const x1 = rect1.left + rect1.width / 2;
        const y1 = rect1.top + rect1.height / 2;
        const x2 = rect2.left + rect2.width / 2;
        const y2 = rect2.top + rect2.height / 2;

        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);

        if (animated) {
          // Если анимация завершена, обновляем конечные позиции
          line.setAttribute('x2', x2);
          line.setAttribute('y2', y2);
        }
        // Если анимация ещё не завершена, позиции x2 и y2 управляются анимацией
      });

      requestAnimationFrame(updatePositions);
    };

    // Начинаем обновление позиций
    updatePositions();
  }
};
