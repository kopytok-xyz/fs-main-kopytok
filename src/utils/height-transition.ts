// https://chatgpt.com/c/670cd6c8-3514-8002-b48e-28e0e79759a7?model=o1-preview

export const func_heightTransition = () => {
  const allElements = document.querySelectorAll('[height-transition]');

  if (allElements.length) {
    allElements.forEach((element) => {
      const transitionDuration = element.getAttribute('height-transition') || '0.5s';

      // Устанавливаем стили для max-height и opacity через JS
      element.style.overflow = 'hidden';
      element.style.transitionProperty = 'max-height, opacity';
      element.style.transitionDuration = `${transitionDuration}, ${transitionDuration}`;
      element.style.transitionTimingFunction = 'ease, ease';

      // Инициализируем состояние элемента
      if (element.classList.contains('collapsed')) {
        element.style.maxHeight = '0';
        element.style.opacity = '0';
      } else {
        element.style.maxHeight = element.scrollHeight + 'px';
        element.style.opacity = '1';
      }

      // Наблюдаем за изменениями класса
      const observer = new MutationObserver(() => {
        if (element.classList.contains('collapsed')) {
          // Анимация скрытия
          element.style.transitionProperty = 'max-height, opacity';
          element.style.transitionDuration = `${transitionDuration}, ${transitionDuration}`;
          element.style.maxHeight = '0';
          element.style.opacity = '0';
        } else {
          // Анимация показа: max-height и opacity с задержкой
          element.style.transitionProperty = 'max-height';
          element.style.transitionDuration = `${transitionDuration}`;
          element.style.maxHeight = element.scrollHeight + 'px';

          // Добавляем задержку для opacity через setTimeout
          setTimeout(() => {
            element.style.transitionProperty = 'opacity';
            element.style.transitionDuration = `${transitionDuration}`;
            element.style.opacity = '1';
          }, 500);
        }
      });

      observer.observe(element, { attributes: true, attributeFilter: ['class'] });
    });
  }
};
