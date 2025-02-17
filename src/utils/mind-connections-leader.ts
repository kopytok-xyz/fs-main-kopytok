export const func_mindConnectionsLeader = () => {
  const checkSelectors = () => {
    const dotPc = document.querySelectorAll('[dot-pc]');
    const dotTablet = document.querySelectorAll('[dot-tablet]');
    const dotMobile = document.querySelectorAll('[dot-mobile]');

    const hasElements = dotPc.length > 0 || dotTablet.length > 0 || dotMobile.length > 0;

    if (hasElements) {
      console.log('Найдены элементы для соединений:', {
        pc: dotPc.length,
        tablet: dotTablet.length,
        mobile: dotMobile.length,
      });
      return true;
    }

    console.log('Элементы для соединений не найдены');
    return false;
  };

  // Инициализация
  if (!checkSelectors()) {
    return;
  }
};
