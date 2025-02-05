export const func_heroForm = () => {
  const forms = document.querySelectorAll('form.main-hero-form');
  forms.forEach((form) => {
    const container = form.closest('[hero-form]');
    const formInputs = form.querySelectorAll('[form-step-input]');
    const figmaInput = form.querySelector('[form-step-input="1"]');
    const emailInput = form.querySelector('[form-step-input="2"]');
    const messageInput = form.querySelector('[form-step-input="3"]');
    const submitButton = form.querySelector('[fs-mirrorclick-element="trigger"]');
    const filledSteps = new Set();

    formInputs.forEach((input) => {
      input.addEventListener('input', handleInputChange);
      input.addEventListener('focus', handleInputFocus);
    });

    function handleInputFocus(e) {
      const step = parseInt(e.target.getAttribute('form-step-input'), 10);
      updateActiveArrow(step);
    }

    function handleInputChange(e) {
      const input = e.target;
      const step = parseInt(input.getAttribute('form-step-input'), 10);
      const value = input.value.trim();

      if (input.errorTimeout) {
        clearTimeout(input.errorTimeout);
        input.errorTimeout = null;
      }

      const isValid = isValidInput(step, value);
      performValidation(input, step, value);

      if (isValid) {
        input.classList.remove('input-error');
      } else {
        if (step === 1) {
          input.classList.add('input-error');
        } else {
          input.errorTimeout = setTimeout(() => {
            const currentValue = input.value.trim();
            const currentIsValid = isValidInput(step, currentValue);
            if (!currentIsValid) {
              input.classList.add('input-error');
            }
            input.errorTimeout = null;
          }, 3000);
        }
      }
    }

    function isValidFigmaLink(value) {
      try {
        const url = new URL(value);
        return url.hostname.toLowerCase().includes('figma.com');
      } catch (_) {
        return false;
      }
    }

    function validateEmail(email) {
      const re = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      return re.test(email);
    }

    function isValidInput(step, value) {
      if (step === 1) {
        return value === '' || isValidFigmaLink(value);
      }
      if (step === 2) {
        return validateEmail(value);
      }
      if (step === 3) {
        return value.length >= 5;
      }
      return false;
    }

    function performValidation(input, step, value) {
      filledSteps.delete(step);
      const isValid = isValidInput(step, value);

      if (step === 1) {
        if (value !== '' && isValidFigmaLink(value)) {
          filledSteps.add(step);
        }
      } else {
        if (isValid) {
          filledSteps.add(step);
        }
      }

      if (isValid) {
        if (step === 1) {
          input.placeholder = 'link to figma project';
        }
        if (step === 2) {
          input.placeholder = 'email';
        }
        if (step === 3) {
          input.placeholder = 'detail about the project (scope, deadlines)';
        }
      } else {
        if (step === 1) {
          input.placeholder = 'Please enter a valid Figma link';
        }
        if (step === 2) {
          input.placeholder = 'Please enter a valid email address';
        }
        if (step === 3) {
          input.placeholder = 'Please enter at least 5 characters';
        }
        resetUIFromStep(step);
      }

      updateUI();
      updateSubmitButtonState();
    }

    function resetUIFromStep(stepNum) {
      for (let i = stepNum; i <= 3; i++) {
        const ill = container ? container.querySelector(`[form-step-ill="${i}"]`) : null;
        ill && ill.classList.remove('is-active');

        const progressItem = container
          ? container.querySelector(`[form-step-progress-item="${i}"]`)
          : null;
        if (progressItem) {
          const lineFiller = progressItem.querySelector('.steps-grid_item-line-filler');
          const stepName = progressItem.querySelector('.rg-12.is-step-name');
          lineFiller && lineFiller.classList.remove('is-active');
          stepName && stepName.classList.remove('is-active');
        }

        const icon = container
          ? container.querySelector(`.figma-zone-steps-icons_item[form-step-ill="${i}"]`)
          : null;
        icon && icon.classList.remove('is-active');
      }
    }

    function updateActiveArrow(stepNum) {
      if (!container) return;
      const illArrows = container.querySelectorAll('[form-step-ill-arrow]');
      illArrows.forEach((arrow) => {
        const arrowStep = parseInt(arrow.getAttribute('form-step-ill-arrow'), 10);
        if (arrowStep === stepNum) {
          arrow.classList.add('is-active');
        } else {
          arrow.classList.remove('is-active');
        }
      });
    }

    function updateUI() {
      if (!container) return;
      for (let i = 1; i <= 3; i++) {
        const ill = container.querySelector(`[form-step-ill="${i}"]`);
        if (filledSteps.has(i)) {
          ill && ill.classList.add('is-active');
        } else {
          ill && ill.classList.remove('is-active');
        }
      }

      for (let i = 1; i <= 3; i++) {
        const progressItem = container.querySelector(`[form-step-progress-item="${i}"]`);
        if (progressItem) {
          const lineFiller = progressItem.querySelector('.steps-grid_item-line-filler');
          const stepName = progressItem.querySelector('.rg-12.is-step-name');
          if (filledSteps.has(i)) {
            lineFiller && lineFiller.classList.add('is-active');
            stepName && stepName.classList.add('is-active');
          } else {
            lineFiller && lineFiller.classList.remove('is-active');
            stepName && stepName.classList.remove('is-active');
          }
        }
      }

      for (let i = 1; i <= 3; i++) {
        const icon = container.querySelector(`.figma-zone-steps-icons_item[form-step-ill="${i}"]`);
        if (filledSteps.has(i)) {
          icon && icon.classList.add('is-active');
        } else {
          icon && icon.classList.remove('is-active');
        }
      }
    }

    function updateSubmitButtonState() {
      if (!submitButton) return;
      if (isFormValid()) {
        submitButton.disabled = false;
      } else {
        submitButton.disabled = true;
      }
    }

    function isFormValid() {
      return (
        isValidInput(1, figmaInput.value.trim()) &&
        isValidInput(2, emailInput.value.trim()) &&
        isValidInput(3, messageInput.value.trim())
      );
    }

    form.addEventListener('submit', function (event) {
      if (!isFormValid()) {
        event.preventDefault();
        event.stopPropagation();
        if (!isValidInput(1, figmaInput.value.trim())) {
          figmaInput.classList.add('input-blink');
          setTimeout(() => {
            figmaInput.classList.remove('input-blink');
          }, 1500);
        }
        return false;
      }
    });

    updateSubmitButtonState();
  });
};

func_heroForm();
