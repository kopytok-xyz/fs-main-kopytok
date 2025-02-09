export const func_faceWorks = () => {
  // Получаем все секции-триггеры
  const triggers = document.querySelectorAll('.work-face-section-trigger');
  // Получаем все элементы с атрибутом face-work-canvas
  const canvases = document.querySelectorAll('[face-work-canvas]');

  if (triggers.length && canvases.length) {
    // Функция для получения параметров последовательности из атрибутов
    const getSequenceParams = (canvas) => {
      const framesLink = canvas.getAttribute('frames-link');
      const finalFrame = parseInt(canvas.getAttribute('final-frame'));

      // Извлекаем базовый URL, заменяя звездочку на плейсхолдер для номера кадра
      const baseUrl = framesLink.replace('*', '');

      return { baseUrl, finalFrame };
    };

    // Функция для получения URL изображения
    const currentFrame = (baseUrl, index) => {
      const formats = ['webp', 'jpg', 'jpeg', 'png']; // Приоритет форматов
      const paddedIndex = (index + 1).toString().padStart(4, '0');

      // Пробуем сначала webp
      return `${baseUrl}${paddedIndex}.${formats[0]}`;
    };

    // Функция для загрузки изображений
    const preloadImages = async (baseUrl, maxFrame) => {
      const images = new Array(maxFrame + 1).fill(null);
      let isLoading = false;

      // Функция проверки видимости туннеля
      const isTunnelVisible = () => {
        const tunnel = document.querySelector('.tunnel');
        if (!tunnel) return false;
        const rect = tunnel.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
      };

      // Функция загрузки одного кадра
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

      // Загрузка кадров с определенным шагом
      const loadBatch = async (step) => {
        const indices = [];
        for (let i = 0; i <= maxFrame; i += step) {
          indices.push(i);
        }

        // Добавляем последний кадр
        if (!indices.includes(maxFrame)) indices.push(maxFrame);

        // Загружаем пачку кадров
        for (const index of indices) {
          if (!isTunnelVisible()) return;
          await loadImage(index);
          // Небольшая пауза между загрузками
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      };

      // Основная функция загрузки
      const startLoading = async () => {
        if (isLoading) return;
        isLoading = true;

        try {
          // Первый проход - каждые 5%
          const step1 = Math.max(1, Math.floor(maxFrame * 0.05));
          await loadBatch(step1);

          if (isTunnelVisible()) {
            // Второй проход - каждые 2.5%
            const step2 = Math.max(1, Math.floor(maxFrame * 0.025));
            await loadBatch(step2);

            // Загружаем оставшиеся кадры
            if (isTunnelVisible()) {
              for (let i = 0; i <= maxFrame; i++) {
                if (!isTunnelVisible() || images[i] !== null) continue;
                await loadImage(i);
                await new Promise((resolve) => setTimeout(resolve, 10));
              }
            }
          }
        } finally {
          isLoading = false;
        }
      };

      // Наблюдатель за видимостью туннеля
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            startLoading();
          }
        },
        { threshold: 0 }
      );

      const tunnel = document.querySelector('.tunnel');
      if (tunnel) observer.observe(tunnel);

      // Запускаем первичную загрузку
      startLoading();

      // Возвращаем прокси для доступа к изображениям
      return new Proxy(images, {
        get(target, prop) {
          if (prop === 'length') return target.length;
          const index = parseInt(prop);
          if (isNaN(index)) return target[prop];

          // Возвращаем ближайший доступный кадр
          if (target[index]) return target[index];

          // Поиск ближайшего доступного кадра
          for (let i = 1; i <= maxFrame; i++) {
            if (target[index - i]) return target[index - i];
            if (target[index + i]) return target[index + i];
          }
          return target[0];
        },
      });
    };

    // Управление видимостью элементов
    const updateVisibility = (index) => {
      document.querySelectorAll('[tunnel-index-div]').forEach((el) => {
        const elIndex = el.getAttribute('tunnel-index-div');
        el.classList.toggle('hide', elIndex !== index.toString());
      });
    };

    // Инициализация для каждого canvas
    canvases.forEach((canvasContainer, index) => {
      const { baseUrl, finalFrame } = getSequenceParams(canvasContainer);
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Настройка canvas
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';

      // Убедимся, что родительский контейнер имеет position: relative
      if (window.getComputedStyle(canvasContainer).position === 'static') {
        canvasContainer.style.position = 'relative';
      }

      const updateCanvasSize = () => {
        const rect = canvasContainer.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Устанавливаем размеры canvas в пикселях с учетом DPI
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // Устанавливаем CSS размеры canvas
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        // Масштабируем контекст
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(dpr, dpr);
      };

      const drawFrame = (img) => {
        if (!img) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvasContainer.getBoundingClientRect();

        // Устанавливаем физические размеры canvas с учетом DPR
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // Устанавливаем CSS размеры canvas
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        // Масштабируем контекст
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(dpr, dpr);

        const canvasRatio = rect.width / rect.height;
        const imageRatio = img.width / img.height;

        let drawWidth, drawHeight, x, y;

        if (canvasRatio > imageRatio) {
          // Canvas шире изображения - подгоняем по ширине
          drawWidth = rect.width;
          drawHeight = rect.width / imageRatio;
          x = 0;
          y = (rect.height - drawHeight) / 2;
        } else {
          // Canvas выше изображения - подгоняем по высоте
          drawHeight = rect.height;
          drawWidth = rect.height * imageRatio;
          x = (rect.width - drawWidth) / 2;
          y = 0;
        }

        // Рисуем изображение с учетом масштабирования
        context.drawImage(img, x, y, drawWidth, drawHeight);
      };

      const resizeObserver = new ResizeObserver(updateCanvasSize);
      resizeObserver.observe(canvasContainer);

      updateCanvasSize();
      canvasContainer.appendChild(canvas);

      // Немедленно загружаем и отображаем первый кадр
      const firstFrame = new Image();
      firstFrame.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawFrame(firstFrame);
      };
      firstFrame.src = currentFrame(baseUrl, 0);

      // Продолжаем загрузку остальных кадров
      preloadImages(baseUrl, finalFrame).then((sequenceImages) => {
        const trigger = triggers[index];
        const animation = { frame: 0 };

        gsap.to(animation, {
          frame: finalFrame,
          snap: 'frame',
          ease: 'none',
          scrollTrigger: {
            trigger: trigger,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.5,
            onUpdate: (self) => {
              const frameIndex = Math.floor(animation.frame);
              if (sequenceImages[frameIndex]) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                drawFrame(sequenceImages[frameIndex]);
              }
              // Обновляем видимость элементов
              if (self.isActive) {
                updateVisibility(index + 1);
              }
            },
          },
        });

        window.addEventListener('resize', () => {
          requestAnimationFrame(() => {
            updateCanvasSize();
            if (sequenceImages[frameIndex]) {
              drawFrame(sequenceImages[frameIndex]);
            }
          });
        });
      });
    });

    // Устанавливаем начальное состояние видимости
    updateVisibility(1);
  }
};
