export const func_faceWorks = () => {
  // Получаем все секции-триггеры
  const triggers = document.querySelectorAll('.work-face-section-trigger');
  // Получаем все элементы с атрибутом tunnel-index-div
  const tunnelDivs = document.querySelectorAll('[tunnel-index-div]');

  if (triggers.length) {
    const handleScroll = () => {
      // Перебираем все триггеры
      triggers.forEach((trigger, triggerIndex) => {
        const rect = trigger.getBoundingClientRect();

        // Рассчитываем процент прокрутки для текущего триггера
        const triggerHeight = rect.height;
        const scrolledPast = -rect.top;
        const scrollPercentage = Math.min(Math.max((scrolledPast / triggerHeight) * 100, 0), 100);

        // Если мы находимся в пределах триггера
        if (rect.top <= 0 && rect.bottom >= 0) {
          console.log(`Триггер ${triggerIndex + 1}: ${scrollPercentage}%`);

          tunnelDivs.forEach((div) => {
            const indexValue = div.getAttribute('tunnel-index-div');

            if (indexValue === String(triggerIndex + 1)) {
              // Показываем элементы текущей секции
              div.classList.remove('hide');

              // Находим все видео в текущем div
              const videos = div.querySelectorAll('video');
              videos.forEach((video) => {
                if (video.duration) {
                  // Устанавливаем время воспроизведения в зависимости от прокрутки
                  video.currentTime = (scrollPercentage / 100) * video.duration;
                }
              });
            } else {
              // Скрываем все остальные элементы
              div.classList.add('hide');
            }
          });
        }
      });
    };

    // Добавляем слушатель события скролла
    window.addEventListener('scroll', handleScroll);

    // Инициализируем видео
    tunnelDivs.forEach((div) => {
      const videos = div.querySelectorAll('video');
      videos.forEach((video) => {
        // Устанавливаем начальное время воспроизведения
        video.currentTime = 0;
        // Отключаем автовоспроизведение
        video.autoplay = false;
        // Отключаем зацикливание
        video.loop = false;
      });
    });

    // Вызываем функцию при инициализации
    handleScroll();
  }
};
