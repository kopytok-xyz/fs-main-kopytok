export const func_togglClassTriggerTarget = () => {
  const all_togglClassTriggerTarget = document.querySelectorAll('[toggl-class-trigger]');
  if (all_togglClassTriggerTarget.length) {
    all_togglClassTriggerTarget.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const triggerValue = trigger.getAttribute('toggl-class-trigger');

        const targetElement = document.querySelector(`[toggl-class-target="${triggerValue}"]`);

        if (targetElement) {
          const className = targetElement.getAttribute('toggl-class-name');

          if (className) {
            targetElement.classList.toggle(className);
          }
        }
      });
    });
  }
};
