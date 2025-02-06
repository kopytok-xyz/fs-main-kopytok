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

      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
      }

      return images;
    };

    // Инициализация канвасов
    canvases.forEach((canvasContainer) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = 1158; // Используем те же размеры, что и в примере Apple
      canvas.height = 770;

      canvasContainer.appendChild(canvas);
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
        // Отрисовываем первый кадр
        if (images[0]) {
          context.drawImage(images[0], 0, 0);
        }
      });

      // Создаем анимацию для текущей секции
      gsap.to(animation, {
        frame: animation.maxFrame - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: trigger,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5,
          onUpdate: (self) => {
            if (sequenceImages.length > 0) {
              const frameIndex = Math.floor(self.progress * (animation.maxFrame - 1));
              context.clearRect(0, 0, canvas.width, canvas.height);
              context.drawImage(sequenceImages[frameIndex], 0, 0);
            }
          },
        },
      });
    });
  }
};
