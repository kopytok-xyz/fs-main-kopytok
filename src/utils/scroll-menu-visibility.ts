export const func_scrollMenuVisibility = () => {
  // Элементы на странице
  const fixedMenu = document.querySelector('[fixed-menu]');
  const staticMenu = document.querySelector('[static-menu]');
  const footerTrigger = document.querySelector('[footer-menu-trigger]');

  // Если нет фиксированного меню, то нет смысла продолжать
  if (!fixedMenu) return;

  // Таймер для отслеживания времени, когда статичное меню не видно
  let staticMenuHiddenTimer: number | null = null;
  const hiddenTimeThreshold = 500; // 0.5 секунды в миллисекундах

  // Функция показа фиксированного меню
  const showFixedMenu = () => {
    fixedMenu.classList.remove('is-hidden');
  };

  // Функция скрытия фиксированного меню
  const hideFixedMenu = () => {
    fixedMenu.classList.add('is-hidden');
  };

  // Если на странице нет статичного меню, сразу показываем фиксированное меню
  if (!staticMenu) {
    showFixedMenu();
    // Но всё равно проверяем футер-триггер, если он есть
    if (footerTrigger) {
      setupFooterTriggerObserver();
    }
    return;
  }

  // Основная логика работы с IntersectionObserver для статичного меню
  const staticMenuObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // Если статичное меню видно
        if (entry.isIntersecting) {
          // Очищаем таймер, если он был запущен
          if (staticMenuHiddenTimer) {
            clearTimeout(staticMenuHiddenTimer);
            staticMenuHiddenTimer = null;
          }
          // Сразу скрываем фиксированное меню
          hideFixedMenu();
        } else {
          // Если статичное меню скрыто, запускаем таймер
          if (!staticMenuHiddenTimer) {
            staticMenuHiddenTimer = window.setTimeout(() => {
              showFixedMenu();
            }, hiddenTimeThreshold);
          }
        }
      });
    },
    { threshold: 0 }
  );

  // Начинаем следить за статичным меню
  staticMenuObserver.observe(staticMenu);

  // Настройка наблюдения за футер-триггером
  function setupFooterTriggerObserver() {
    if (!footerTrigger) return;

    const footerTriggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Если триггер виден, скрываем фиксированное меню
            hideFixedMenu();
          } else {
            // Если триггер не виден, возвращаемся к основной логике
            if (staticMenu) {
              // Проверяем видимость статичного меню
              const staticMenuEntry = document.querySelector('[static-menu]');
              if (staticMenuEntry) {
                const rect = staticMenuEntry.getBoundingClientRect();
                const isVisible =
                  rect.top >= 0 &&
                  rect.left >= 0 &&
                  rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                  rect.right <= (window.innerWidth || document.documentElement.clientWidth);

                // Если статичное меню не видно, показываем фиксированное
                if (!isVisible) {
                  showFixedMenu();
                }
              } else {
                showFixedMenu();
              }
            } else {
              showFixedMenu();
            }
          }
        });
      },
      { threshold: 0 }
    );

    footerTriggerObserver.observe(footerTrigger);
  }

  // Если есть футер-триггер, настраиваем его наблюдателя
  if (footerTrigger) {
    setupFooterTriggerObserver();
  }
};
