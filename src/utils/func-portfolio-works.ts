export const func_portfolioWorks = () => {
  const canvases = document.querySelectorAll('[face-work-canvas-portfolio]');

  if (!canvases.length) return;

  // Очередь загрузки канвасов
  const loadingQueue = new Map();

  // Функция для генерации последовательности загрузки кадров
  const generateLoadingSequence = (finalFrame) => {
    const sequences = [];
    // Первая последовательность - каждые 10%
    sequences.push(
      Array.from({ length: Math.ceil(finalFrame / 100) + 1 }, (_, i) => i * 100).filter(
        (n) => n <= finalFrame
      )
    );

    // Вторая последовательность - каждые 5%
    sequences.push(
      Array.from({ length: Math.ceil(finalFrame / 50) + 1 }, (_, i) => i * 50).filter(
        (n) => n <= finalFrame
      )
    );

    // Финальная последовательность - все оставшиеся кадры
    sequences.push(Array.from({ length: finalFrame + 1 }, (_, i) => i));

    return sequences;
  };

  // Функция для загрузки изображений с приоритетом
  const preloadImagesWithPriority = async (baseUrl, finalFrame, onProgress) => {
    const sequences = generateLoadingSequence(finalFrame);
    const loadedImages = new Array(finalFrame + 1);

    for (const sequence of sequences) {
      await Promise.all(
        sequence
          .filter((frameIndex) => frameIndex <= finalFrame)
          .map(async (frameIndex) => {
            if (!loadedImages[frameIndex]) {
              try {
                const img = new Image();
                const src = currentFrame(baseUrl, frameIndex);

                img.src = src;
                await new Promise((resolve, reject) => {
                  img.onload = () => resolve(img);
                  img.onerror = () => reject(new Error(`Failed to load ${src}`));
                });

                loadedImages[frameIndex] = img;
                onProgress?.(loadedImages.filter(Boolean));
              } catch (error) {
                console.warn(`Failed to load frame ${frameIndex}:`, error);
              }
            }
          })
      );
    }

    return loadedImages.filter(Boolean);
  };

  // Общая функция drawFrame для всех канвасов
  const drawFrame = (context, canvasContainer, img) => {
    if (!img) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvasContainer.getBoundingClientRect();
    const { canvas } = context;

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

  // Добавляем функцию updateCanvasImages после функции preloadImagesWithPriority
  const updateCanvasImages = (canvasContainer, images) => {
    const slider = canvasContainer
      .closest('.div-block-85')
      ?.querySelector('.fs-rangeslider_handle');

    if (!slider) return;

    const canvas = canvasContainer.querySelector('canvas');
    const context = canvas?.getContext('2d');
    if (!context || !canvas) return;

    const updateFrame = () => {
      const currentValue = parseInt(slider.getAttribute('aria-valuenow')) || 0;
      const frameIndex = Math.floor((currentValue / 3000) * (images.length - 1));

      if (images[frameIndex]) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawFrame(context, canvasContainer, images[frameIndex]);
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'aria-valuenow') {
          requestAnimationFrame(updateFrame);
        }
      });
    });

    observer.observe(slider, {
      attributes: true,
      attributeFilter: ['aria-valuenow'],
    });
  };

  // Функция управления очередью загрузки
  const manageLoadingQueue = (canvasContainer, isVisible) => {
    const containerId = canvasContainer.dataset.canvasId;

    if (isVisible) {
      // Добавляем в очередь
      loadingQueue.set(containerId, canvasContainer);
    } else {
      // Удаляем из очереди
      loadingQueue.delete(containerId);
    }

    // Запускаем загрузку для следующего в очереди
    processLoadingQueue();
  };

  // Обработка очереди загрузки
  const processLoadingQueue = () => {
    const queueEntries = Array.from(loadingQueue.entries());
    if (queueEntries.length === 0) return;

    // Получаем последний добавленный канвас
    const [latestId, latestCanvas] = queueEntries[queueEntries.length - 1];

    // Начинаем загрузку если она еще не началась
    if (!latestCanvas.dataset.loading) {
      latestCanvas.dataset.loading = 'true';
      const { baseUrl, finalFrame } = getSequenceParams(latestCanvas);

      preloadImagesWithPriority(baseUrl, finalFrame, (images) => {
        updateCanvasImages(latestCanvas, images);
      }).then(() => {
        latestCanvas.dataset.loading = 'complete';
        // После загрузки текущего канваса, переходим к следующему в очереди
        loadingQueue.delete(latestId);
        processLoadingQueue();
      });
    }
  };

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
  canvases.forEach((canvasContainer, index) => {
    // Присваиваем уникальный ID
    canvasContainer.dataset.canvasId = `canvas-${index}`;

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

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(canvasContainer);

    updateCanvasSize();
    canvasContainer.appendChild(canvas);

    // Загружаем первый кадр немедленно
    const firstFrame = new Image();
    firstFrame.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawFrame(context, canvasContainer, firstFrame);
    };
    firstFrame.src = currentFrame(baseUrl, 0);

    // Наблюдаем за видимостью
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'portfolio-item') {
          const isVisible =
            canvasContainer.closest('[portfolio-item]').getAttribute('portfolio-item') ===
            'visible';
          manageLoadingQueue(canvasContainer, isVisible);
        }
      });
    });

    observer.observe(canvasContainer.closest('[portfolio-item]'), {
      attributes: true,
      attributeFilter: ['portfolio-item'],
    });
  });

  // Добавляем функцию для работы с тогглом портфолио
  const setupPortfolioToggles = () => {
    const portfolioItems = document.querySelectorAll('[portfolio-item]');

    // Устанавливаем начальное состояние
    portfolioItems.forEach((item, index) => {
      const contentElement = item.querySelector('[portfolio-item-toggle-content]');
      if (!contentElement) return;

      if (index === 0) {
        item.setAttribute('portfolio-item', 'visible');
        contentElement.style.height = `${contentElement.scrollHeight}px`;
        contentElement.style.transition = 'height 0.3s ease';
      } else {
        item.setAttribute('portfolio-item', 'hidden');
        contentElement.style.height = '0px';
        contentElement.style.transition = 'height 0.3s ease';
      }

      // Добавляем обработчик для анимации
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'portfolio-item') {
            const isVisible = item.getAttribute('portfolio-item') === 'visible';
            const contentElement = item.querySelector('[portfolio-item-toggle-content]');

            if (contentElement) {
              if (isVisible) {
                contentElement.style.height = `${contentElement.scrollHeight}px`;
              } else {
                contentElement.style.height = '0px';
              }
            }
          }
        });
      });

      observer.observe(item, {
        attributes: true,
        attributeFilter: ['portfolio-item'],
      });
    });

    // Остальной код обработчиков кликов остается без изменений
    portfolioItems.forEach((item) => {
      const ignoreElements = item.querySelectorAll('[portfolio-item-toggle-ignore]');
      const autoToggleElements = item.querySelectorAll('[portfolio-item-toggle-auto]');

      // Добавляем обработчик клика на сам элемент portfolio-item
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

        // Находим и кликаем на ближайший триггер
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
