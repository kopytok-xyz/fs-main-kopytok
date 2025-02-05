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
        const scrollPercentage = Math.round((scrolledPast / triggerHeight) * 100);

        // Выводим информацию в консоль только если мы находимся в пределах триггера
        if (rect.top <= 0 && rect.bottom >= 0) {
          console.log(`Триггер ${triggerIndex + 1}: ${scrollPercentage}%`);

          tunnelDivs.forEach((div) => {
            const indexValue = div.getAttribute('tunnel-index-div');

            if (indexValue === String(triggerIndex + 1)) {
              // Показываем элементы текущей секции
              div.classList.remove('hide');
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
    // Вызываем функцию при инициализации для проверки начального состояния
    handleScroll();
  }
};
