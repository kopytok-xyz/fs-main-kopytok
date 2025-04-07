export const func_collapsedClassHeightTransition = () => {
  // Константа для задания одинакового времени transition
  const TRANSITION_DURATION = '0.5s';
  const TRANSITION_DURATION_MS = parseFloat(TRANSITION_DURATION) * 1000;

  // Создаем стиль для transition
  const addTransitionStyles = () => {
    // Проверяем, существует ли уже наш стиль
    if (!document.getElementById('collapsed-transition-styles')) {
      const style = document.createElement('style');
      style.id = 'collapsed-transition-styles';
      style.innerHTML = `
        .collapsed-transition {
          transition-property: max-height, opacity !important;
          transition-duration: ${TRANSITION_DURATION}, ${TRANSITION_DURATION} !important;
          transition-timing-function: ease-in-out, ease-in-out !important;
          will-change: max-height, opacity !important;
          overflow: hidden !important;
          transform: translateZ(0); /* принудительное ускорение GPU */
          backface-visibility: hidden; /* принудительное ускорение GPU */
        }
      `;
      document.head.appendChild(style);
    }
  };

  // Добавляем стили в head
  addTransitionStyles();

  // Находим все элементы с классом collapsed или те, которые могут получить этот класс
  const collapsibleElements = document.querySelectorAll(
    '.collapsed, [class*="collapsed"], [collapse-element-class], [transition-test]'
  );

  if (collapsibleElements.length) {
    collapsibleElements.forEach((element) => {
      // Приводим Element к HTMLElement для доступа к style
      const htmlElement = element as HTMLElement;

      // Добавляем класс для transition
      htmlElement.classList.add('collapsed-transition');

      // Гарантируем, что transition будет работать устанавливая inline стили
      htmlElement.style.transitionProperty = 'max-height, opacity';
      htmlElement.style.transitionDuration = `${TRANSITION_DURATION}, ${TRANSITION_DURATION}`;
      // Изменяем на ease-in-out для более плавной анимации
      htmlElement.style.transitionTimingFunction = 'ease-in-out, ease-in-out';
      htmlElement.style.willChange = 'max-height, opacity';
      htmlElement.style.overflow = 'hidden';

      // Добавляем GPU-ускорение
      htmlElement.style.transform = 'translateZ(0)';
      htmlElement.style.backfaceVisibility = 'hidden';

      // Инициализируем начальное состояние
      const isInitiallyCollapsed = htmlElement.classList.contains('collapsed');

      if (isInitiallyCollapsed) {
        // Принудительный reflow перед установкой начальных стилей
        void htmlElement.offsetHeight;

        htmlElement.style.maxHeight = '0';
        htmlElement.style.opacity = '0';

        // Не устанавливаем display: none сразу, дождемся окончания анимации
        setTimeout(() => {
          if (htmlElement.classList.contains('collapsed')) {
            htmlElement.style.display = 'none';
          }
        }, TRANSITION_DURATION_MS);
      } else {
        // Сбрасываем стили, если элемент изначально не свернут
        const minHeight = 50; // Минимальная гарантированная высота для элементов с scrollHeight=0
        const scrollHeight = Math.max(htmlElement.scrollHeight, minHeight);
        const maxHeightValue = Math.max(scrollHeight, 1000) + 'px';

        // Принудительный reflow перед установкой начальных стилей
        void htmlElement.offsetHeight;

        htmlElement.style.maxHeight = maxHeightValue;
        htmlElement.style.opacity = '1';
        htmlElement.style.display = 'flex'; // Всегда используем flex
      }

      // Сохраняем оригинальный display для восстановления
      if (!htmlElement.dataset.originalDisplay) {
        // Всегда предпочитаем flex для отображения
        htmlElement.dataset.originalDisplay = 'flex';
      }

      // Создаем функцию для нормализации измерения высоты (с учетом возможного scrollHeight=0)
      const getMeasuredHeight = (el: HTMLElement) => {
        // Сначала проверяем, не display: none ли элемент
        const currentDisplay = window.getComputedStyle(el).display;
        if (currentDisplay === 'none') {
          el.style.display = 'flex';
          // Принудительный reflow
          void el.offsetHeight;
        }

        // Устанавливаем minimum height для нулевых значений
        const minHeight = 50;
        const currentHeight = Math.max(el.scrollHeight, minHeight);
        return currentHeight;
      };

      // Наблюдаем за изменениями класса
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const isCollapsed = htmlElement.classList.contains('collapsed');

            // Предотвращаем множественные анимации
            if (htmlElement.dataset.isAnimating === 'true') {
              return;
            }

            // Устанавливаем флаг анимации
            htmlElement.dataset.isAnimating = 'true';

            if (isCollapsed) {
              // Получаем актуальную высоту с защитой от нулевых значений
              const currentHeight = getMeasuredHeight(htmlElement);
              htmlElement.style.maxHeight = currentHeight + 'px';

              // Активируем GPU для ускорения
              htmlElement.style.willChange = 'max-height, opacity';

              // Важно дать время браузеру усвоить начальную высоту
              setTimeout(() => {
                // Принудительный reflow перед анимацией
                void htmlElement.offsetHeight;

                // Этап 1: Анимация высоты
                requestAnimationFrame(() => {
                  // Запускаем анимацию высоты
                  htmlElement.style.maxHeight = '0';

                  // Этап 2: После изменения высоты меняем прозрачность
                  setTimeout(() => {
                    htmlElement.style.opacity = '0';

                    // Этап 3: После завершения всех анимаций устанавливаем display: none
                    setTimeout(() => {
                      if (htmlElement.classList.contains('collapsed')) {
                        htmlElement.style.display = 'none';
                      }
                      // Снимаем флаг анимации
                      htmlElement.dataset.isAnimating = 'false';
                    }, TRANSITION_DURATION_MS);
                  }, TRANSITION_DURATION_MS);
                });
              }, 20); // 20мс достаточно для браузерного цикла
            } else {
              // Для появления сначала убираем display: none
              htmlElement.style.display = 'flex'; // Всегда используем flex

              // Устанавливаем opacity: 0 для начала анимации
              htmlElement.style.opacity = '0';

              // Устанавливаем изначальную высоту 0
              htmlElement.style.maxHeight = '0';

              // Активируем GPU для ускорения
              htmlElement.style.willChange = 'max-height, opacity';

              // Принудительный reflow перед изменением стилей
              void htmlElement.offsetHeight;

              // Даем браузеру время отрисовать начальное состояние
              setTimeout(() => {
                // Этап 1: Анимация высоты
                requestAnimationFrame(() => {
                  // Получаем актуальную высоту с защитой от нулевых значений
                  const minHeight = 50;
                  const currentScrollHeight = Math.max(htmlElement.scrollHeight, minHeight);
                  const newHeight = Math.max(currentScrollHeight, 1000);

                  // Устанавливаем достаточно большое значение max-height
                  htmlElement.style.maxHeight = newHeight + 'px';

                  // Этап 2: После изменения высоты меняем прозрачность
                  setTimeout(() => {
                    // Анимируем прозрачность
                    htmlElement.style.opacity = '1';

                    // Этап 3: После завершения всех анимаций устанавливаем auto height
                    setTimeout(() => {
                      htmlElement.style.maxHeight = 'none';
                      // Деактивируем GPU для экономии ресурсов
                      htmlElement.style.willChange = 'auto';
                      // Снимаем флаг анимации
                      htmlElement.dataset.isAnimating = 'false';
                    }, TRANSITION_DURATION_MS);
                  }, TRANSITION_DURATION_MS);
                });
              }, 20); // 20мс достаточно для браузерного цикла
            }
          }
        });
      });

      // Настраиваем MutationObserver для отлсеживания изменений класса
      observer.observe(htmlElement, {
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: true, // Сохраняем старое значение для лучшей работы
      });
    });
  }
};
