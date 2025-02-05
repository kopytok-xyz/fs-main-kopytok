export const func_global = () => {
  const currentYearField = document.getElementById('current-year');
  if (currentYearField) {
    currentYearField.innerText = new Date().getFullYear();
  }
};
