export const func_yearCounter = () => {
  const all_yearCounter = document.querySelectorAll('[year-counter]');
  if (all_yearCounter.length) {
    const currentYear = new Date().getFullYear();
    const yearsPassed = currentYear - 2016;

    all_yearCounter.forEach((element) => {
      element.textContent = yearsPassed;
    });
  }
};
