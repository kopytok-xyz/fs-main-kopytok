export const func_interactiveZone = () => {
  const all_newAlements = document.querySelectorAll('[interactive-zone]');
  if (all_newAlements.length) {
    const formLink = document.querySelector('[main-form-link]');
    const formEmail = document.querySelector('[main-form-email]');
    const formMessage = document.querySelector('[main-form-message]');
    const interactiveZone = document.querySelector('[interactive-zone]');

    function updateStatus() {
      const linkValue = formLink.value.trim();
      const emailValue = formEmail.value.trim();
      const messageValue = formMessage.value.trim();

      let status;

      if (!linkValue) {
        status = 1;
      } else if (linkValue && !emailValue) {
        status = 2;
      } else if (linkValue && emailValue && !messageValue) {
        status = 3;
      } else {
        status = 4; // Все поля заполнены
      }

      console.log('Текущий статус:', status);

      // Обновление интерактивной зоны в зависимости от статуса
      updateInteractiveZone(status);
    }

    function updateInteractiveZone(status) {
      // Очистка интерактивной зоны
      interactiveZone.innerHTML = '';
      interactiveZone.className = ''; // Сброс классов

      if (status === 1) {
        interactiveZone.classList.add('status-1');
        // Лого Figma
        const figmaLogo = document.createElement('div');
        figmaLogo.className = 'figma-logo';
        interactiveZone.appendChild(figmaLogo);

        // Вопросительные знаки
        for (let i = 0; i < 3; i++) {
          const questionMark = document.createElement('div');
          questionMark.className = 'question-mark';
          questionMark.textContent = '?';
          questionMark.style.top = Math.random() * 80 + 10 + '%';
          questionMark.style.left = Math.random() * 80 + 10 + '%';
          interactiveZone.appendChild(questionMark);
        }

        // Стрелка к лого Webflow
        const arrow = document.createElement('div');
        arrow.className = 'arrow';
        interactiveZone.appendChild(arrow);

        const webflowLogo = document.createElement('div');
        webflowLogo.className = 'webflow-logo';
        interactiveZone.appendChild(webflowLogo);
      } else if (status === 2) {
        interactiveZone.classList.add('status-2');
        // Иконка почты
        const mailIcon = document.createElement('div');
        mailIcon.className = 'mail-icon';
        interactiveZone.appendChild(mailIcon);

        // Вопросительные знаки
        for (let i = 0; i < 3; i++) {
          const questionMark = document.createElement('div');
          questionMark.className = 'question-mark';
          questionMark.textContent = '?';
          questionMark.style.top = Math.random() * 80 + 10 + '%';
          questionMark.style.left = Math.random() * 80 + 10 + '%';
          interactiveZone.appendChild(questionMark);
        }
      } else if (status === 3) {
        interactiveZone.classList.add('status-3');
        // Пустая страница
        const emptyPage = document.createElement('div');
        emptyPage.className = 'empty-page';
        interactiveZone.appendChild(emptyPage);

        // Вопросительные пузырьки
        for (let i = 0; i < 3; i++) {
          const questionBubble = document.createElement('div');
          questionBubble.className = 'question-bubble';
          questionBubble.textContent = '?';
          questionBubble.style.top = Math.random() * 80 + 10 + '%';
          questionBubble.style.left = Math.random() * 80 + 10 + '%';
          interactiveZone.appendChild(questionBubble);
        }
      } else if (status === 4) {
        interactiveZone.classList.add('status-4');
        // Сообщение об успехе
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Все поля заполнены!';
        interactiveZone.appendChild(successMessage);
      }
    }

    // Добавляем слушатели событий к полям формы
    formLink.addEventListener('input', updateStatus);
    formEmail.addEventListener('input', updateStatus);
    formMessage.addEventListener('input', updateStatus);

    // Первоначальное обновление статуса
    updateStatus();

    // Функция для отладки в консоли
    window.getCurrentStatus = function () {
      return {
        linkFilled: formLink.value.trim() !== '',
        emailFilled: formEmail.value.trim() !== '',
        messageFilled: formMessage.value.trim() !== '',
      };
    };
  }
};
