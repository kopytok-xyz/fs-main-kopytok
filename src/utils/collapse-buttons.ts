//https://chatgpt.com/c/6706c363-9760-8002-957f-ae7a48e4b0ad
//--
export const func_collapseButtons = () => {
  const allSections = document.querySelectorAll('[collapse-section]');
  if (allSections.length) {
    allSections.forEach((section) => {
      const button = section.querySelector('[collapse-button]');
      const elementsToToggle = section.querySelectorAll('[collapse-element-class]');
      if (button) {
        button.addEventListener('click', () => {
          button.classList.toggle('is-active');
          elementsToToggle.forEach((element) => {
            const classToToggle = element.getAttribute('collapse-element-class');
            if (classToToggle) {
              element.classList.toggle(classToToggle);
            }
          });
        });
      }
    });
  }
};
