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
      return `${baseUrl}${(index + 1).toString().padStart(4, '0')}.jpg`;
    };

    // Функция для загрузки изображений
    const preloadImages = async (baseUrl, maxFrame) => {
      const images = [];
      const loadImage = (index) => {
        return new Promise((resolve) => {
          const img = new Image();

          img.onload = () => resolve({ success: true, img });
          img.onerror = () => resolve({ success: false });

          img.src = currentFrame(baseUrl, index);
        });
      };

      for (let i = 0; i <= maxFrame; i++) {
        const result = await loadImage(i);
        if (!result.success) {
          console.warn(`Не удалось загрузить кадр ${i}. Прекращаем загрузку.`);
          break;
        }
        images.push(result.img);
      }

      if (images.length === 0) {
        console.error('Не удалось загрузить ни одного кадра');
        return images;
      }

      console.log(`Успешно загружено ${images.length} кадров из ${maxFrame + 1}`);
      return images;
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

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // Сбрасываем трансформацию
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(dpr, dpr);
      };

      const drawFrame = (img) => {
        if (!img) return;

        const canvasRatio = canvas.width / canvas.height;
        const imageRatio = img.width / img.height;

        let drawWidth, drawHeight, x, y;

        if (canvasRatio > imageRatio) {
          // Канвас шире изображения - подгоняем по ширине
          drawWidth = canvas.width;
          drawHeight = canvas.width / imageRatio;
          x = 0;
          y = (canvas.height - drawHeight) / 2;
        } else {
          // Канвас выше изображения - подгоняем по высоте
          drawHeight = canvas.height;
          drawWidth = canvas.height * imageRatio;
          x = (canvas.width - drawWidth) / 2;
          y = 0;
        }

        context.drawImage(img, x, y, drawWidth, drawHeight);
      };

      const resizeObserver = new ResizeObserver(updateCanvasSize);
      resizeObserver.observe(canvasContainer);

      updateCanvasSize();
      canvasContainer.appendChild(canvas);

      // Загрузка изображений и настройка ScrollTrigger
      preloadImages(baseUrl, finalFrame).then((sequenceImages) => {
        const trigger = triggers[index];
        const animation = { frame: 0 };

        // Сразу отрисовываем первый кадр
        if (sequenceImages[0]) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          drawFrame(sequenceImages[0]);
        }

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
      });
    });

    // Устанавливаем начальное состояние видимости
    updateVisibility(1);
  }
};
