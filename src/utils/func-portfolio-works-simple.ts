const isElementVisible = (element) => {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden';
};

export const func_portfolioWorksSimple = () => {
  const pcLottieElements = document.querySelectorAll('[face-work-lottie-portfolio-pc]');
  const mobileLottieElements = document.querySelectorAll('[face-work-lottie-portfolio-mobile]');

  if (!pcLottieElements.length && !mobileLottieElements.length) return;

  const animations = new Map();

  const initLottieAnimation = async (container) => {
    // Проверяем видимость элемента перед загрузкой
    if (!isElementVisible(container)) return null;

    const lottieUrl =
      container.getAttribute('face-work-lottie-portfolio-pc') ||
      container.getAttribute('face-work-lottie-portfolio-mobile');

    try {
      const response = await fetch(lottieUrl);
      const animationData = await response.json();

      const anim = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData,
      });

      return anim;
    } catch (error) {
      console.error('Failed to load Lottie animation:', error);
      return null;
    }
  };

  const updateLottieProgress = (animations, slider) => {
    if (!animations.size) return;

    const currentValue = parseInt(slider.getAttribute('aria-valuenow')) || 0;
    const progress = currentValue / 3000; // 0 to 1

    // Обновляем все анимации для данного слайдера
    animations.forEach((animation) => {
      const frame = animation.totalFrames * (0.01 + progress * 0.98);
      animation.goToAndStop(frame, true);
    });
  };

  // Функция для инициализации анимаций для контейнера
  const initializeAnimationsForContainer = (container, slider) => {
    const portfolioItem = container.closest('[portfolio-item]');
    if (!portfolioItem || !slider) return;

    // Наблюдаем за изменением состояния portfolio-item
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'portfolio-item') {
          const isVisible = portfolioItem.getAttribute('portfolio-item') === 'visible';

          if (isVisible && !animations.has(container)) {
            initLottieAnimation(container).then((animation) => {
              if (animation) {
                animations.set(container, animation);
                updateLottieProgress(new Map([[container, animation]]), slider);
              }
            });
          } else if (!isVisible && animations.has(container)) {
            const animation = animations.get(container);
            animation.destroy();
            animations.delete(container);
          }
        }
      });
    });

    observer.observe(portfolioItem, {
      attributes: true,
      attributeFilter: ['portfolio-item'],
    });

    return observer;
  };

  // Обработка PC и Mobile элементов
  const processLottieElements = () => {
    const portfolioItems = document.querySelectorAll('[portfolio-item]');

    portfolioItems.forEach((item) => {
      const pcContainer = item.querySelector('[face-work-lottie-portfolio-pc]');
      const mobileContainer = item.querySelector('[face-work-lottie-portfolio-mobile]');
      const slider = item.querySelector('.fs-rangeslider_handle');

      if (!slider) return;

      // Инициализируем обе анимации
      if (pcContainer) {
        initializeAnimationsForContainer(pcContainer, slider);
      }
      if (mobileContainer) {
        initializeAnimationsForContainer(mobileContainer, slider);
      }

      // Наблюдаем за изменением значения слайдера
      const sliderObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'aria-valuenow') {
            // Собираем все активные анимации для данного слайдера
            const itemAnimations = new Map();
            if (pcContainer && animations.has(pcContainer)) {
              itemAnimations.set(pcContainer, animations.get(pcContainer));
            }
            if (mobileContainer && animations.has(mobileContainer)) {
              itemAnimations.set(mobileContainer, animations.get(mobileContainer));
            }
            updateLottieProgress(itemAnimations, slider);
          }
        });
      });

      sliderObserver.observe(slider, {
        attributes: true,
        attributeFilter: ['aria-valuenow'],
      });
    });
  };

  // Запускаем обработку элементов
  processLottieElements();

  // Добавляем функцию для работы с тогглом портфолио
  const setupPortfolioToggles = () => {
    const portfolioItems = document.querySelectorAll('[portfolio-item]');

    portfolioItems.forEach((item, index) => {
      const contentElement = item.querySelector('[portfolio-item-toggle-content]');
      const toggleIcon = item.querySelector('[project-item-toggle]');
      if (!contentElement) return;

      if (index === 0) {
        item.setAttribute('portfolio-item', 'visible');
        contentElement.style.transition = 'height 0.3s ease';
        updateContentHeight(contentElement);
        if (toggleIcon) {
          toggleIcon.style.transform = 'rotate(180deg)';
        }
      } else {
        item.setAttribute('portfolio-item', 'hidden');
        contentElement.style.height = '0px';
        contentElement.style.transition = 'height 0.3s ease';
        if (toggleIcon) {
          toggleIcon.style.transform = 'rotate(0deg)';
        }
      }

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'portfolio-item') {
            const isVisible = item.getAttribute('portfolio-item') === 'visible';
            const contentElement = item.querySelector('[portfolio-item-toggle-content]');
            const toggleIcon = item.querySelector('[project-item-toggle]');

            if (contentElement) {
              if (isVisible) {
                updateContentHeight(contentElement);
                if (toggleIcon) {
                  toggleIcon.style.transform = 'rotate(180deg)';
                }
              } else {
                contentElement.style.height = '0px';
                if (toggleIcon) {
                  toggleIcon.style.transform = 'rotate(0deg)';
                }
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

const updateContentHeight = async (contentElement) => {
  // Ждем следующего кадра
  await new Promise((resolve) => requestAnimationFrame(resolve));

  // Находим все Lottie контейнеры внутри контента
  const lottieContainers = contentElement.querySelectorAll(
    '[face-work-lottie-portfolio-pc], [face-work-lottie-portfolio-mobile]'
  );

  // Ждем загрузки всех видимых Lottie анимаций
  const visibleLottiePromises = Array.from(lottieContainers)
    .filter((container) => isElementVisible(container))
    .map((container) => {
      return new Promise((resolve) => {
        const checkLottie = () => {
          const svg = container.querySelector('svg');
          if (svg && svg.getBoundingClientRect().height > 0) {
            resolve();
          } else {
            setTimeout(checkLottie, 50);
          }
        };
        checkLottie();
      });
    });

  await Promise.all(visibleLottiePromises);

  // Добавляем небольшую задержку для надежности
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (contentElement) {
    // Конвертируем пиксели в rem
    const pixelsToRem = (pixels) => {
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
      return `${pixels / rootFontSize}rem`;
    };

    contentElement.style.height = pixelsToRem(contentElement.scrollHeight);
  }
};
