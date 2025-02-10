export const func_mindConnectionsLeader = () => {
  let lastDrawTimeout: NodeJS.Timeout | null = null;
  const lines: LeaderLine[] = [];

  const drawConnections = (isRetry = false) => {
    // Удаляем предыдущие линии
    lines.forEach((line) => line.remove());
    lines.length = 0;

    const dots = document.querySelectorAll('[mind-connection-new]');
    const dotsMap = new Map();

    dots.forEach((dot) => {
      const value = dot.getAttribute('mind-connection-new');
      if (!value) return;

      const style = window.getComputedStyle(dot);
      if (style.display === 'none') return;

      if (!dotsMap.has(value)) {
        dotsMap.set(value, []);
      }
      dotsMap.get(value).push(dot);
    });

    dotsMap.forEach((dots, value) => {
      if (dots.length === 2) {
        console.log(`Создаю соединение для значения: ${value}`);
        const line = new LeaderLine(dots[0], dots[1], {
          color: '#666666',
          size: 1,
          path: 'straight',
          startSocket: 'bottom',
          endSocket: 'top',
          startPlug: 'behind',
          endPlug: 'behind',
          endPlugSize: 1,
          startPlugSize: 1,
        });
        lines.push(line);
      }
    });

    // Устанавливаем отложенную проверку только если это не повторная попытка
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

  // Первичная отрисовка
  drawConnections();

  // Добавляем слушатель ресайза
  window.addEventListener('resize', () => drawConnections());
};
