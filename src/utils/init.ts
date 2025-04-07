import { func_buttonTextToggl } from './button-text-toggl';
import { initClickBlocker } from './click-blocker';
import { func_collapseButtons } from './collapse-buttons';
import { func_heightTransition } from './height-transition';
import { func_syncClick } from './sync-click';
import { func_togglClassTriggerTarget } from './toggl-class-trigger-target';

// Функция инициализации всех скриптов в правильном порядке
export const initializeAllScripts = () => {
  // Сначала инициализируем ClickBlocker с большим временем, чтобы избежать проблем с рассинхронизацией
  initClickBlocker(1500); // 1.5 секунды блокировки

  // Затем инициализируем скрипты
  func_heightTransition();
  func_collapseButtons();
  func_buttonTextToggl();
  func_syncClick();
  func_togglClassTriggerTarget();
};

// Автоматически инициализируем скрипты при загрузке DOM
document.addEventListener('DOMContentLoaded', initializeAllScripts);
