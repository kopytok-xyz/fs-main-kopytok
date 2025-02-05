// https://chatgpt.com/c/670cea8a-bc94-8002-b197-dd310bed0b59

export const func_syncClick = () => {
  const all_newElements = document.querySelectorAll('[sync-click]');
  const elementPairs = new Map();
  const recentlyClicked = new WeakSet(); // Для отслеживания недавно кликнутых элементов

  // Группируем элементы по значению атрибута [sync-click]
  all_newElements.forEach((el) => {
    const syncValue = el.getAttribute('sync-click');
    if (!elementPairs.has(syncValue)) {
      elementPairs.set(syncValue, []);
    }
    elementPairs.get(syncValue).push(el);
  });

  // Оставляем только пары (если больше двух — игнорируем)
  elementPairs.forEach((elements, syncValue) => {
    if (elements.length !== 2) {
      elementPairs.delete(syncValue);
    }
  });

  // Функция для временного запрета синхронного клика
  const temporarilyDisableSyncClick = (element) => {
    recentlyClicked.add(element);
    setTimeout(() => {
      recentlyClicked.delete(element);
    }, 500); // 0.5 секунд
  };

  // Добавляем обработчики кликов
  elementPairs.forEach((elements) => {
    const [el1, el2] = elements;

    el1.addEventListener('click', () => {
      if (!recentlyClicked.has(el1)) {
        temporarilyDisableSyncClick(el1);
        if (!recentlyClicked.has(el2)) {
          el2.click(); // Кликаем по второму элементу
        }
      }
    });

    el2.addEventListener('click', () => {
      if (!recentlyClicked.has(el2)) {
        temporarilyDisableSyncClick(el2);
        if (!recentlyClicked.has(el1)) {
          el1.click(); // Кликаем по первому элементу
        }
      }
    });
  });
};
