// https://chatgpt.com/c/670d0603-7358-8002-8d85-c28096dce66c
export const func_buttonTextToggl = () => {
  const all_newAlements = document.querySelectorAll('[button-text-toggl]');
  if (all_newAlements.length) {
    all_newAlements.forEach((button) => {
      const textElement = button.querySelector('[button-text-toggl-values]');
      if (textElement) {
        // Разделяем текст на два значения
        const values = textElement.getAttribute('button-text-toggl-values').split('/');
        if (values.length === 2) {
          // Устанавливаем первое значение по умолчанию
          textElement.textContent = values[0];

          // Добавляем обработчик клика
          button.addEventListener('click', (e) => {
            e.preventDefault();
            // Текущий текст
            const currentText = textElement.textContent;
            // Переключаем между двумя значениями
            textElement.textContent = currentText === values[0] ? values[1] : values[0];
          });
        }
      }
    });
  }
};
