export const func_faceWorksSimple = () => {
  // Получаем элемент tunnel
  const tunnel = document.querySelector('.tunnel');

  if (!tunnel) return;

  // Получаем все секции-триггеры внутри tunnel
  const triggers = tunnel.querySelectorAll('.work-face-section-trigger');

  if (triggers.length) {
    // Управление видимостью элементов
    const updateVisibility = (index) => {
      document.querySelectorAll('[tunnel-index-div]').forEach((el) => {
        const elIndex = el.getAttribute('tunnel-index-div');
        el.classList.toggle('hide', elIndex !== index.toString());
      });
    };

    // Инициализация для каждого триггера
    triggers.forEach((trigger, index) => {
      // Настраиваем ScrollTrigger для каждого триггера
      gsap.to(
        {},
        {
          scrollTrigger: {
            trigger: trigger,
            start: 'top top',
            end: 'bottom top',
            onUpdate: (self) => {
              // Обновляем видимость элементов
              if (self.isActive) {
                updateVisibility(index + 1);
              }
            },
          },
        }
      );
    });

    // Устанавливаем начальное состояние видимости
    updateVisibility(1);
  }
};
