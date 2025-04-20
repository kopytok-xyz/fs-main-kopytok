const isElementVisible = (element) => {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden';
};

export const func_portfolioWorksSimple = () => {
  const pcLottieElements = document.querySelectorAll('[face-work-lottie-portfolio-pc]');
  const mobileLottieElements = document.querySelectorAll('[face-work-lottie-portfolio-mobile]');

  if (!pcLottieElements.length && !mobileLottieElements.length) return;

  const animations = new Map();
  // Кеш для хранения загруженных JSON-данных анимаций
  const animationDataCache = new Map();

  const initLottieAnimation = async (container) => {
    // Проверяем видимость элемента перед загрузкой
    if (!isElementVisible(container)) return null;

    const lottieUrl =
      container.getAttribute('face-work-lottie-portfolio-pc') ||
      container.getAttribute('face-work-lottie-portfolio-mobile');

    // Находим прогресс-бар для этого контейнера
    const portfolioItem = container.closest('[portfolio-item]');
    if (!portfolioItem) return null;

    const progressBar = portfolioItem.querySelector('.portfolio-progress-bar');

    // Устанавливаем начальное состояние прогресс-бара
    if (progressBar) {
      progressBar.style.width = '0%';
      progressBar.style.opacity = '1';
      progressBar.style.transition = 'width 0.3s ease-out';
    }

    // Функция для мерцания прогресс-бара
    const startPulsating = () => {
      if (!progressBar || !portfolioItem) return;

      // Убираем предыдущие переходы и анимации
      progressBar.style.transition = 'none';
      progressBar.style.animation = 'none';

      // Форсируем перерасчет стилей
      void progressBar.offsetWidth;

      // Добавляем анимацию пульсации
      progressBar.style.animation = 'progress-pulse 1.2s ease-in-out infinite';

      // Добавляем CSS-анимацию, если её ещё нет
      if (!document.querySelector('#progress-pulse-keyframes')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'progress-pulse-keyframes';
        styleSheet.textContent = `
          @keyframes progress-pulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
        `;
        document.head.appendChild(styleSheet);
      }

      // Добавляем тултип на элемент
      portfolioItem.setAttribute('title', 'Almost ready... Please wait while content is loading');
    };

    // Функция для остановки мерцания и скрытия прогресс-бара
    const stopPulsatingAndHide = () => {
      if (!progressBar || !portfolioItem) return;

      // Останавливаем анимацию
      progressBar.style.animation = 'none';

      // Плавно скрываем прогресс-бар
      progressBar.style.transition = 'opacity 0.3s ease-out';
      progressBar.style.opacity = '0';

      // Удаляем тултип
      portfolioItem.removeAttribute('title');
    };

    // Функция обновления прогресс-бара
    const updateProgressBar = (percent) => {
      if (!progressBar) return;

      // Обновляем ширину
      progressBar.style.width = `${percent}%`;

      // Если загрузка завершена, начинаем мерцание
      if (percent >= 100) {
        startPulsating();

        // Проверяем, полностью ли раскрыт контент каждые 100мс
        const checkContentReady = () => {
          const contentElement = portfolioItem.querySelector('[portfolio-item-toggle-content]');

          if (contentElement) {
            // Проверяем, полностью ли раскрыт элемент (высота > 0)
            const isReady =
              parseInt(contentElement.style.height) > 0 &&
              isElementVisible(container) &&
              container.querySelector('svg');

            if (isReady) {
              // Когда содержимое полностью отображено, скрываем прогресс-бар
              stopPulsatingAndHide();
            } else {
              // Проверяем еще раз через небольшой интервал
              setTimeout(checkContentReady, 100);
            }
          }
        };

        // Запускаем проверку готовности содержимого
        checkContentReady();
      }
    };

    // Проверяем, есть ли данные в кеше
    if (animationDataCache.has(lottieUrl)) {
      // Используем кешированные данные
      const cachedData = animationDataCache.get(lottieUrl);

      // Показываем моментальный прогресс
      if (progressBar) {
        progressBar.style.transition = 'width 0.2s ease-out';
        updateProgressBar(100);
      }

      // Создаем анимацию из кешированных данных
      const anim = lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData: cachedData,
      });

      return anim;
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', lottieUrl, true);
      xhr.responseType = 'json';

      // Переменные для отслеживания и оценки прогресса
      let lastLoaded = 0;
      let maxLoaded = 0;
      let lastPercent = 0;
      let lastIncrement = Date.now();

      // Расчет приблизительного процента на основе скорости загрузки и текущего прогресса
      xhr.onprogress = (event) => {
        const now = Date.now();

        // Используем lengthComputable, если доступно
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          if (percent !== lastPercent) {
            // Обновляем прогресс-бар с точным процентом
            updateProgressBar(percent);
            lastPercent = percent;
          }
          return;
        }

        // Отслеживаем максимальный размер загруженных данных
        if (event.loaded > maxLoaded) {
          maxLoaded = event.loaded;
        }

        // Обновляем прогресс только каждые 200мс
        if (now - lastIncrement > 200) {
          // Если видим, что данные всё еще загружаются
          const bytesInPeriod = event.loaded - lastLoaded;

          if (bytesInPeriod > 0) {
            // Предполагаем, что загружено примерно 25%, 50%, 75% при последовательных обновлениях
            let estimatedPercent = 0;

            if (event.loaded < 1024 * 1024) {
              // Меньше 1MB
              estimatedPercent = 25;
            } else if (event.loaded < 3 * 1024 * 1024) {
              // Меньше 3MB
              estimatedPercent = 50;
            } else if (event.loaded < 5 * 1024 * 1024) {
              // Меньше 5MB
              estimatedPercent = 75;
            } else {
              estimatedPercent = 90; // Больше 5MB, предполагаем близко к концу
            }

            // Обновляем прогресс-бар если процент изменился
            if (estimatedPercent > lastPercent) {
              updateProgressBar(estimatedPercent);
              lastPercent = estimatedPercent;
            }
          }

          lastLoaded = event.loaded;
          lastIncrement = now;
        }
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            const animationData = xhr.response;
            // Обновляем прогресс-бар до 100%
            updateProgressBar(100);

            // Сохраняем данные в кеш для быстрого повторного использования
            animationDataCache.set(lottieUrl, animationData);

            const anim = lottie.loadAnimation({
              container: container,
              renderer: 'svg',
              loop: false,
              autoplay: false,
              animationData,
            });
            resolve(anim);
          } catch (error) {
            console.error('Ошибка при создании анимации Lottie:', error);
            reject(error);
          }
        } else {
          console.error('Ошибка загрузки Lottie:', xhr.statusText);
          reject(new Error(`Ошибка HTTP: ${xhr.status}`));
        }
      };

      xhr.onerror = function () {
        console.error('Ошибка сети при загрузке Lottie');
        reject(new Error('Ошибка сети'));
      };

      // Начинаем загрузку
      xhr.send();
    });
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
            // Не уничтожаем анимацию полностью, а просто удаляем её из активных
            // animation.destroy(); - старый вариант
            animation.stop(); // Просто останавливаем анимацию
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
