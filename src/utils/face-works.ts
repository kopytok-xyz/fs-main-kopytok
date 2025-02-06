export const func_faceWorks = () => {
  // Получаем все секции-триггеры
  const triggers = document.querySelectorAll('.work-face-section-trigger');
  // Получаем все элементы с атрибутом face-work-canvas
  const canvases = document.querySelectorAll('[face-work-canvas]');

  if (triggers.length && canvases.length) {
    // Создаем объект для хранения параметров анимации
    const animation = {
      frame: 0,
      maxFrame: 147,
    };

    // Функция для получения URL изображения
    const currentFrame = (index) =>
      `https://www.apple.com/105/media/us/airpods-pro/2019/1299e2f5_9206_4470_b28e_08307a42f19b/anim/sequence/large/01-hero-lightpass/${(index + 1).toString().padStart(4, '0')}.jpg`;

    // Функция для загрузки изображений
    const preloadImages = async () => {
      const images = [];
      const frameCount = animation.maxFrame;

      const loadImage = (index) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = currentFrame(index);
        });
      };

      for (let i = 0; i < frameCount; i++) {
        const img = await loadImage(i);
        images.push(img);
      }

      return images;
    };

    // Инициализация канвасов
    canvases.forEach((canvasContainer) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // Устанавливаем стили для canvas
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

      // Сохраняем функцию drawFrame в контексте canvas для использования позже
      canvas.drawFrame = drawFrame;
    });

    // Настройка ScrollTrigger для каждого триггера
    triggers.forEach((trigger, index) => {
      const currentCanvas = document.querySelector(`[face-work-canvas="${index + 1}"]`);
      const canvas = currentCanvas.querySelector('canvas');
      const context = canvas.getContext('2d');

      // Загружаем изображения для текущей последовательности
      let sequenceImages = [];
      preloadImages().then((images) => {
        sequenceImages = images;

        // Создаем ScrollTrigger
        gsap.to(animation, {
          frame: animation.maxFrame - 1,
          snap: 'frame',
          ease: 'none',
          scrollTrigger: {
            trigger: trigger,
            start: 'top center',
            end: 'bottom center',
            scrub: 0.5,
          },
          onUpdate: () => {
            const frameIndex = Math.floor(animation.frame);
            if (sequenceImages[frameIndex]) {
              context.clearRect(0, 0, canvas.width, canvas.height);
              canvas.drawFrame(sequenceImages[frameIndex]);
            }
          },
        });
      });
    });
  }
};
