export const func_portfolioWorks = () => {
  const canvases = document.querySelectorAll('[face-work-canvas-portfolio]');

  if (!canvases.length) return;

  // Функция для получения параметров последовательности из атрибутов
  const getSequenceParams = (canvas) => {
    const framesLink = canvas.getAttribute('frames-link');
    const finalFrame = parseInt(canvas.getAttribute('final-frame'));
    const baseUrl = framesLink.replace('*', '');
    return { baseUrl, finalFrame };
  };

  // Функция для получения URL изображения
  const currentFrame = (baseUrl, index) => {
    const formats = ['webp', 'jpg', 'jpeg', 'png'];
    const paddedIndex = (index + 1).toString().padStart(4, '0');
    return `${baseUrl}${paddedIndex}.${formats[0]}`;
  };

  // Функция для загрузки изображений
  const preloadImages = async (baseUrl, maxFrame) => {
    const images = new Array(maxFrame + 1).fill(null);
    let isLoading = false;

    const loadImage = async (index) => {
      if (images[index] !== null) return true;

      const img = new Image();
      return new Promise((resolve) => {
        img.onload = () => {
          images[index] = img;
          resolve(true);
        };
        img.onerror = () => resolve(false);
        img.src = currentFrame(baseUrl, index);
      });
    };

    // Основная функция загрузки
    const startLoading = async () => {
      if (isLoading) return;
      isLoading = true;

      try {
        // Загружаем все кадры последовательно
        for (let i = 0; i <= maxFrame; i++) {
          await loadImage(i);
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      } finally {
        isLoading = false;
      }
    };

    // Запускаем загрузку
    startLoading();

    // Возвращаем прокси для доступа к изображениям
    return new Proxy(images, {
      get(target, prop) {
        if (prop === 'length') return target.length;
        const index = parseInt(prop);
        if (isNaN(index)) return target[prop];

        if (target[index]) return target[index];

        for (let i = 1; i <= maxFrame; i++) {
          if (target[index - i]) return target[index - i];
          if (target[index + i]) return target[index + i];
        }
        return target[0];
      },
    });
  };

  // Инициализация для каждого canvas
  canvases.forEach((canvasContainer) => {
    const { baseUrl, finalFrame } = getSequenceParams(canvasContainer);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Настройка canvas
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    if (window.getComputedStyle(canvasContainer).position === 'static') {
      canvasContainer.style.position = 'relative';
    }

    const updateCanvasSize = () => {
      const rect = canvasContainer.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);
    };

    const drawFrame = (img) => {
      if (!img) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvasContainer.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);

      const canvasRatio = rect.width / rect.height;
      const imageRatio = img.width / img.height;

      let drawWidth, drawHeight, x, y;

      if (canvasRatio > imageRatio) {
        drawWidth = rect.width;
        drawHeight = rect.width / imageRatio;
        x = 0;
        y = (rect.height - drawHeight) / 2;
      } else {
        drawHeight = rect.height;
        drawWidth = rect.height * imageRatio;
        x = (rect.width - drawWidth) / 2;
        y = 0;
      }

      context.drawImage(img, x, y, drawWidth, drawHeight);
    };

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(canvasContainer);

    updateCanvasSize();
    canvasContainer.appendChild(canvas);

    // Загружаем первый кадр
    const firstFrame = new Image();
    firstFrame.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawFrame(firstFrame);
    };
    firstFrame.src = currentFrame(baseUrl, 0);

    // Загружаем остальные кадры и настраиваем наблюдение за aria-valuenow
    preloadImages(baseUrl, finalFrame).then((sequenceImages) => {
      const slider = canvasContainer
        .closest('.div-block-85')
        .querySelector('.fs-rangeslider_handle');

      const updateFrame = () => {
        const currentValue = parseInt(slider.getAttribute('aria-valuenow')) || 0;
        const frameIndex = Math.floor((currentValue / 1000) * finalFrame);

        if (sequenceImages[frameIndex]) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          drawFrame(sequenceImages[frameIndex]);
        }
      };

      // Наблюдаем за изменениями aria-valuenow
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'aria-valuenow') {
            updateFrame();
          }
        });
      });

      observer.observe(slider, {
        attributes: true,
        attributeFilter: ['aria-valuenow'],
      });

      window.addEventListener('resize', () => {
        requestAnimationFrame(() => {
          updateCanvasSize();
          updateFrame();
        });
      });
    });
  });

  // Добавляем функцию для работы с тогглом портфолио
  const setupPortfolioToggles = () => {
    const portfolioItems = document.querySelectorAll('[portfolio-item]');

    portfolioItems.forEach((item) => {
      // Устанавливаем начальное состояние
      item.setAttribute('portfolio-item', 'hidden');

      // Находим элементы, которые не должны триггерить тоггл
      const ignoreElements = item.querySelectorAll('[portfolio-item-toggle-ignore]');
      const autoToggleElements = item.querySelectorAll('[portfolio-item-toggle-auto]');

      // Добавляем обработчик клика
      item.addEventListener('click', (e) => {
        // Проверяем, не является ли целевой элемент или его родители игнорируемыми
        let shouldIgnore = false;
        let target = e.target as HTMLElement;

        while (target && target !== item) {
          if (target.hasAttribute('portfolio-item-toggle-ignore')) {
            shouldIgnore = true;
            break;
          }
          target = target.parentElement;
        }

        // Если клик был на игнорируемом элементе и не на auto-toggle, прекращаем выполнение
        if (shouldIgnore) {
          // Проверяем, был ли клик на auto-toggle элементе
          let isAutoToggle = false;
          target = e.target as HTMLElement;

          while (target && target !== item) {
            if (target.hasAttribute('portfolio-item-toggle-auto')) {
              isAutoToggle = true;
              break;
            }
            target = target.parentElement;
          }

          if (!isAutoToggle) return;
        }

        // Переключаем состояние
        const currentState = item.getAttribute('portfolio-item');
        const newState = currentState === 'hidden' ? 'visible' : 'hidden';
        item.setAttribute('portfolio-item', newState);

        // Находим и кликаем на триггер
        const trigger = item.querySelector('[work-toggl-trigger]');
        if (trigger) {
          trigger.dispatchEvent(
            new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true,
            })
          );
        }

        // Закрываем все остальные открытые элементы
        portfolioItems.forEach((otherItem) => {
          if (otherItem !== item && otherItem.getAttribute('portfolio-item') === 'visible') {
            otherItem.setAttribute('portfolio-item', 'hidden');
            const otherTrigger = otherItem.querySelector('[work-toggl-trigger]');
            if (otherTrigger) {
              otherTrigger.dispatchEvent(
                new MouseEvent('click', {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                })
              );
            }
          }
        });
      });
    });
  };

  // Вызываем функцию настройки тогглов после инициализации канвасов
  setupPortfolioToggles();
};
