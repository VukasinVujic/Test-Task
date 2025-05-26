class Accordion {
  constructor(element, options = {}) {
    this.accordion = element;
    this.options = {
      allowMultiple: options.allowMultiple || false,
      defaultOpen: options.defaultOpen || [] // Array of indices to open by default
    };

    this.triggers = Array.from(this.accordion.querySelectorAll('.accordion-trigger'));
    this.contents = Array.from(this.accordion.querySelectorAll('.accordion-content'));

    // Wrap content in an inner div for padding (to make animations smoother)
    this.contents.forEach(content => {
      const inner = document.createElement('div');
      inner.className = 'accordion-content-inner';

      // Move content's child elements to the inner div
      while (content.firstChild) {
        inner.appendChild(content.firstChild);
      }

      content.appendChild(inner);
    });

    this.init();
  }

  init() {
    // Set up default open sections
    this.options.defaultOpen.forEach(index => {
      if (this.triggers[index]) {
        this.open(index, false);
      }
    });

    // Add event listeners
    this.triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => this.toggle(index));

      // Keyboard accessibility
      trigger.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'Enter':
          case ' ': // Space
            e.preventDefault();
            this.toggle(index);
            break;
          case 'ArrowDown':
            e.preventDefault();
            this.focusNext(index);
            break;
          case 'ArrowUp':
            e.preventDefault();
            this.focusPrevious(index);
            break;
          case 'Home':
            e.preventDefault();
            this.focusFirst();
            break;
          case 'End':
            e.preventDefault();
            this.focusLast();
            break;
        }
      });
    });
  }

  toggle(index) {
    const trigger = this.triggers[index];
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      this.close(index);
    } else {
      this.open(index);
    }
  }

  open(index, closePrevious = true) {
    const trigger = this.triggers[index];
    const content = this.contents[index];

    // Close other panels if not allowing multiple
    if (closePrevious && !this.options.allowMultiple) {
      this.closeAll(index);
    }

    // Update attributes
    trigger.setAttribute('aria-expanded', 'true');
    content.removeAttribute('hidden');

    // Set actual height for animation
    const height = content.querySelector('.accordion-content-inner').offsetHeight;
    content.style.maxHeight = `${height}px`;
  }

  close(index) {
    const trigger = this.triggers[index];
    const content = this.contents[index];

    trigger.setAttribute('aria-expanded', 'false');
    content.style.maxHeight = '0px';

    // Add hidden attribute after transition
    setTimeout(() => {
      if (trigger.getAttribute('aria-expanded') === 'false') {
        content.setAttribute('hidden', '');
      }
    }, parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--accordion-transition-speed')) * 1000 || 300);
  }

  closeAll(exceptIndex = -1) {
    this.triggers.forEach((_, index) => {
      if (index !== exceptIndex) {
        this.close(index);
      }
    });
  }

  focusNext(currentIndex) {
    const nextIndex = (currentIndex + 1) % this.triggers.length;
    this.triggers[nextIndex].focus();
  }

  focusPrevious(currentIndex) {
    const prevIndex = (currentIndex - 1 + this.triggers.length) % this.triggers.length;
    this.triggers[prevIndex].focus();
  }

  focusFirst() {
    this.triggers[0].focus();
  }

  focusLast() {
    this.triggers[this.triggers.length - 1].focus();
  }
}

// Initialize all accordions on the page
document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.accordion');

  accordions.forEach(accordionElement => {
    // You can customize options per accordion
    new Accordion(accordionElement, {
      allowMultiple: false,
      defaultOpen: [0] // Open first panel by default
    });
  });
});
