export const func_mindConnectionsLeader = () => {
  let lastDrawTimeout: NodeJS.Timeout | null = null;
  const lines: LeaderLine[] = [];
  const shouldUpdateLines = true;

  const updateAllLines = () => {
    if (!shouldUpdateLines) return;
    lines.forEach((line) => line.position());
    requestAnimationFrame(updateAllLines);
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
          startSocket: 'center',
          endSocket: 'center',
          startPlug: 'behind',
          endPlug: 'behind',
          endPlugSize: 1,
          startPlugSize: 1,
          elementAnchor: 'center',
        });
        lines.push(line);
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
