// https://chat.openai.com/
// version_fullCode_v2
// - finds all elements with [client-slug] and counts them
// - updates [client-slug-counter] text with the count
// - distributes [testimonial-to-append] evenly into .testimonial-cards-waiter
// - toggles .is-active on click of [section-toggle="testimonials"]

export const func_testimonialsGrid = () => {
  const all_testimonialsGrid = document.querySelectorAll('.section_testimonials');
  if (!all_testimonialsGrid.length) return;

  const slugElements = document.querySelectorAll('[client-slug]');
  const slugMap = {};
  slugElements.forEach((el) => {
    const slugValue = el.getAttribute('client-slug');
    if (!slugMap[slugValue]) slugMap[slugValue] = 0;
    slugMap[slugValue]++;
  });

  const counters = document.querySelectorAll('[client-slug-counter]');
  counters.forEach((counterEl) => {
    const counterValue = counterEl.getAttribute('client-slug-counter');
    counterEl.textContent = slugMap[counterValue] ? slugMap[counterValue] : 0;
  });

  const cardsToAppend = document.querySelectorAll('[testimonial-to-append]');
  const waiterElements = document.querySelectorAll('.testimonial-cards-waiter');
  cardsToAppend.forEach((card, i) => {
    const targetWaiter = waiterElements[i % waiterElements.length];
    targetWaiter.appendChild(card);
  });

  // Функция для переключения видимости отзывов
  const toggleTestimonials = () => {
    waiterElements.forEach((waiter) => {
      waiter.classList.toggle('is-active');
    });
    const mainGrid = document.querySelector('.testimonials-grid.is-main');
    if (mainGrid) {
      mainGrid.classList.toggle('is-active');
    }

    // Управление видимостью триггеров открытия
    const openTriggers = document.querySelectorAll('.testimonial-open-trigger');
    openTriggers.forEach((trigger) => {
      // Если отзывы показываются (mainGrid имеет класс is-active),
      // добавляем класс hide к триггеру, иначе убираем
      if (mainGrid && mainGrid.classList.contains('is-active')) {
        trigger.classList.add('hide');
      } else {
        trigger.classList.remove('hide');
      }
    });
  };

  // Обработчик клика на кнопку переключения
  const toggleEl = document.querySelector('[section-toggle="testimonials"]');
  if (toggleEl) {
    toggleEl.addEventListener('click', toggleTestimonials);
  }

  // Обработчик клика на триггеры открытия
  const openTriggers = document.querySelectorAll('.testimonial-open-trigger');
  openTriggers.forEach((trigger) => {
    trigger.addEventListener('click', toggleTestimonials);
  });
};
