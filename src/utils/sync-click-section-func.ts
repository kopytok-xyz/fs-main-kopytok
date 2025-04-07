export function func_syncClickSection() {
  const all_newAlements = document.querySelectorAll('[sync-click-section]');
  if (all_newAlements.length) {
    //внутри всех sync-click-section найти элементы с атрибутом [sync-click-section_click-trigger], надо отслеживать клик по ним
    all_newAlements.forEach((section) => {
      const clickTriggers = section.querySelectorAll('[sync-click-section_click-trigger]');

      clickTriggers.forEach((trigger) => {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();

          // Находим элементы для тоглинга классов
          const toggleClassElements = section.querySelectorAll('[sync-click-section_toggle-class]');
          toggleClassElements.forEach((element) => {
            const classToToggle = element.getAttribute('sync-click-section_toggle-class');
            if (classToToggle) {
              element.classList.toggle(classToToggle);
            }
          });

          // Находим элементы для тоглинга текста
          const toggleTextElements = section.querySelectorAll('[sync-click-section_toggle-text]');
          toggleTextElements.forEach((element) => {
            const textValues = element.getAttribute('sync-click-section_toggle-text');
            if (textValues) {
              const [firstText, secondText] = textValues.split('/');

              if (element.textContent === firstText) {
                element.textContent = secondText;
              } else {
                element.textContent = firstText;
              }
            }
          });
        });
      });
    });
    //при клике надо в тоглить классы в дочерних элементах с атрибутом [sync-click-section_toggle-class] и тоглить тексты с в доччерних элементах с атрибутом [sync-click-section_toggle-text]
  }
}
