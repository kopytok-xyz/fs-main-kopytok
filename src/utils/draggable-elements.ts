export const func_draggableElem = () => {
  // Функция для превращения элемента в перетаскиваемый
  function makeElementDraggable(el) {
    if (el.draggableSetup) return; // Предотвращаем повторную инициализацию
    el.draggableSetup = true;

    // Принудительно устанавливаем позиционирование relative
    el.style.position = 'relative';

    let isDragging = false;
    let startX, startY;
    let origLeft = parseFloat(getComputedStyle(el).left) || 0;
    let origTop = parseFloat(getComputedStyle(el).top) || 0;

    function onMouseDown(e) {
      if (e.button !== 0) return; // Реагируем только на левую кнопку мыши
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      // Получаем текущие значения left и top
      origLeft = parseFloat(getComputedStyle(el).left) || 0;
      origTop = parseFloat(getComputedStyle(el).top) || 0;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      e.preventDefault(); // Предотвращаем выделение текста
    }

    function onMouseMove(e) {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      el.style.left = origLeft + deltaX + 'px';
      el.style.top = origTop + deltaY + 'px';
    }

    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    // Сохраняем обработчик для последующего удаления, если потребуется
    el.onMouseDownHandler = onMouseDown;
    el.addEventListener('mousedown', onMouseDown);
  }

  // Функция для удаления перетаскивания с элемента
  function removeDraggable(el) {
    if (!el.draggableSetup) return;

    el.draggableSetup = false;
    el.removeEventListener('mousedown', el.onMouseDownHandler);
    el.onMouseDownHandler = null;
  }

  // Создаем MutationObserver для отслеживания изменений атрибутов и добавления новых узлов
  const observer = new MutationObserver(function (mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.getAttribute('draggable-k') === 'true') {
            makeElementDraggable(node);
          }
        });
      } else if (mutation.type === 'attributes' && mutation.attributeName === 'draggable-k') {
        const { target } = mutation;
        if (target.getAttribute('draggable-k') === 'true') {
          makeElementDraggable(target);
        } else {
          removeDraggable(target);
        }
      }
    }
  });

  // Настраиваем observer для наблюдения за всеми элементами на странице
  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ['draggable-k'],
    childList: true, // Добавлено для отслеживания добавления новых узлов
  });

  // Инициализация существующих элементов с draggable-k="true"
  const initialDraggableElems = document.querySelectorAll('[draggable-k="true"]');
  initialDraggableElems.forEach((el) => {
    makeElementDraggable(el);
  });
};
