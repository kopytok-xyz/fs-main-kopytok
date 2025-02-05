// Version: cardFly-v1.22
export const func_cardFly = () => {
  const el_cardFlyParents = document.querySelectorAll('[card-fly-parent]');

  if (el_cardFlyParents.length) {
    el_cardFlyParents.forEach((parent) => {
      const sea = parent.querySelector('[card-fly-sea]');
      const grid = parent.querySelector('[card-fly-grid]');
      const toggle = parent.querySelector('[card-fly-toggl]');
      const cards = Array.from(parent.querySelectorAll('[card-fly-child]'));

      let animationActive = false;

      const gridHeight = grid.offsetHeight;

      // Вычисляем размер 1rem в пикселях
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

      let cardPositions;

      // Функция для инициализации позиций карточек
      function initCardPositions() {
        cardPositions = cards.map((card) => {
          const rect = card.getBoundingClientRect();
          const parentRect = parent.getBoundingClientRect();
          return {
            card,
            left: (rect.left - parentRect.left) / rem,
            top: (rect.top - parentRect.top) / rem,
            width: rect.width / rem,
            height: rect.height / rem,
          };
        });
      }

      // Инициализируем позиции карточек
      initCardPositions();

      // Проверяем значение атрибута card-fly-parent, чтобы определить начальное состояние анимации
      const parentAttr = parent.getAttribute('card-fly-parent');
      if (parentAttr === 'on') {
        animationActive = true;
      }

      // Функция для активации/деактивации анимации
      function toggleAnimation() {
        animationActive = !animationActive;

        if (animationActive) {
          startAnimation();
        } else {
          stopAnimation();
        }
      }

      // Добавляем обработчик события на переключатель
      toggle.addEventListener('click', toggleAnimation);

      // Запускаем анимацию, если она должна быть активна при загрузке страницы
      if (animationActive) {
        startAnimation();
      }

      function startAnimation() {
        // Активируем режим моря
        grid.style.transition = 'height 1s ease';
        grid.style.height = '0';

        // Устанавливаем относительное позиционирование для родителя
        parent.style.position = 'relative';

        // Обновляем позиции карточек после изменения DOM
        initCardPositions();

        const parentRect = parent.getBoundingClientRect();
        const seaRect = sea.getBoundingClientRect();

        // Преобразуем координаты моря в rem
        const seaRectRem = {
          left: (seaRect.left - parentRect.left) / rem,
          top: (seaRect.top - parentRect.top) / rem,
          width: seaRect.width / rem,
          height: seaRect.height / rem,
        };

        // Обрабатываем все карточки
        cards.forEach((card, index) => {
          // Устанавливаем абсолютное позиционирование
          card.style.position = 'absolute';

          // Отключаем переходы для медуз
          card.style.transition = 'none';

          // Устанавливаем размеры в rem
          card.style.width = `${cardPositions[index].width}rem`;
          card.style.height = `${cardPositions[index].height}rem`;

          // Присваиваем уникальный идентификатор для каждой карточки
          if (!card.dataset.id) {
            card.dataset.id = Math.random().toString(36).substr(2, 9);
          }

          // Вычисляем начальную позицию в сетке
          const gridX = cardPositions[index].left;
          const gridY = cardPositions[index].top;

          card.style.left = `${gridX}rem`;
          card.style.top = `${gridY}rem`;
        });

        // Принудительно вызываем reflow для применения стилей
        parent.offsetHeight;

        // Используем requestAnimationFrame, чтобы дать браузеру применить стили
        requestAnimationFrame(() => {
          // Восстанавливаем переходы для медуз
          cards.forEach((card) => {
            card.style.transition = 'left 1s ease, top 1s ease';
          });

          // Теперь размещаем медуз в случайных позициях в море
          cards.forEach((card) => {
            const randomX =
              seaRectRem.left + Math.random() * (seaRectRem.width - parseFloat(card.style.width));
            const randomY =
              seaRectRem.top + Math.random() * (seaRectRem.height - parseFloat(card.style.height));

            card.style.left = `${randomX}rem`;
            card.style.top = `${randomY}rem`;

            // Сохраняем позиции в море для взаимодействия с курсором
            card.dataset.seaLeft = randomX;
            card.dataset.seaTop = randomY;
          });

          // Добавляем обработчик движения мыши по морю
          sea.addEventListener('mousemove', onSeaMouseMove);
        });
      }

      function stopAnimation() {
        // Добавляем переход для плавного возврата высоты сетки
        grid.style.transition = 'height 1s ease';
        grid.style.height = `${gridHeight / rem}rem`;

        // Устанавливаем переходы для медуз
        cards.forEach((card) => {
          card.style.transition = 'left 1s ease, top 1s ease';
        });

        // Принудительно вызываем reflow для применения стилей
        parent.offsetHeight;

        // Используем requestAnimationFrame, чтобы дать браузеру применить стили
        requestAnimationFrame(() => {
          cards.forEach((card, index) => {
            // Возвращаем карточки на исходные позиции в сетке
            const gridX = cardPositions[index].left;
            const gridY = cardPositions[index].top;

            // Устанавливаем позиции
            card.style.left = `${gridX}rem`;
            card.style.top = `${gridY}rem`;

            // Добавляем обработчик завершения перехода
            const transitionEndHandler = function (event) {
              if (event.propertyName === 'left' || event.propertyName === 'top') {
                // Убираем абсолютное позиционирование и сбрасываем стили
                card.style.position = '';
                card.style.left = '';
                card.style.top = '';
                card.style.width = '';
                card.style.height = '';
                card.style.transition = '';

                card.removeEventListener('transitionend', transitionEndHandler);
              }
            };

            card.addEventListener('transitionend', transitionEndHandler);

            // Очищаем дополнительные данные
            delete card.dataset.seaLeft;
            delete card.dataset.seaTop;
          });
        });

        // Убираем обработчик движения мыши
        sea.removeEventListener('mousemove', onSeaMouseMove);
      }

      function onSeaMouseMove(event) {
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        cards.forEach((card) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenterX = cardRect.left + cardRect.width / 2;
          const cardCenterY = cardRect.top + cardRect.height / 2;

          const dx = cardCenterX - mouseX;
          const dy = cardCenterY - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          const maxDistance = 100; // Радиус воздействия курсора
          if (distance < maxDistance) {
            const moveFactor = (maxDistance - distance) / maxDistance;
            const offsetX = dx * moveFactor * 0.2; // Сила отталкивания по X
            const offsetY = dy * moveFactor * 0.2; // Сила отталкивания по Y

            const originalLeft = parseFloat(card.dataset.seaLeft);
            const originalTop = parseFloat(card.dataset.seaTop);

            const newLeft = originalLeft + offsetX / rem;
            const newTop = originalTop + offsetY / rem;

            card.style.transition = 'left 0.2s ease, top 0.2s ease';
            card.style.left = `${newLeft}rem`;
            card.style.top = `${newTop}rem`;
          } else {
            const originalLeft = parseFloat(card.dataset.seaLeft);
            const originalTop = parseFloat(card.dataset.seaTop);

            card.style.transition = 'left 0.5s ease, top 0.5s ease';
            card.style.left = `${originalLeft}rem`;
            card.style.top = `${originalTop}rem`;
          }
        });
      }
    });
  }
};
