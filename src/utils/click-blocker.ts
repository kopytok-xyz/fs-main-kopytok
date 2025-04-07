// Утилита для управления блокировкой кликов на элементах
export class ClickBlocker {
  private static blockedElements = new WeakMap<Element, boolean>();
  private static blockDuration = 1000; // Время блокировки в мс

  // Блокировать элемент
  static blockElement(element: Element): boolean {
    if (this.isBlocked(element)) {
      return false; // Элемент уже заблокирован
    }

    this.blockedElements.set(element, true);

    setTimeout(() => {
      this.blockedElements.delete(element);
    }, this.blockDuration);

    return true; // Элемент успешно заблокирован
  }

  // Проверить, заблокирован ли элемент
  static isBlocked(element: Element): boolean {
    return this.blockedElements.has(element);
  }

  // Установить длительность блокировки
  static setBlockDuration(duration: number): void {
    this.blockDuration = duration;
  }
}

// Экспортируем функцию для инициализации
export const initClickBlocker = (duration?: number): void => {
  if (duration) {
    ClickBlocker.setBlockDuration(duration);
  }
};
