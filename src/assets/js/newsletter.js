document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.newsletter-form-inner');
  if (!forms.length) return;

  const MSG_SUCCESS = 'Almost there. Check your inbox to confirm, and new posts will land in your email.';
  const MSG_ERROR = 'Something went wrong. Try again, or grab the <a href="/feed.xml" class="newsletter-error-link">RSS feed</a> instead.';

  forms.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = form.querySelector('input[name="email"]');
      const honeypot = form.querySelector('input[name="url"]');
      const button = form.querySelector('.newsletter-button');
      const messageEl = form.closest('.newsletter-form').querySelector('.newsletter-message');

      // Honeypot check: if filled, silently "succeed" to not reveal to bot
      if (honeypot && honeypot.value) {
        showMessage(messageEl, 'success', MSG_SUCCESS);
        disableForm(emailInput, button);
        return;
      }

      const email = emailInput.value.trim();
      if (!email) return;

      // Loading state
      button.disabled = true;
      const textSpan = button.querySelector('.newsletter-button-text');
      const originalText = textSpan ? textSpan.textContent : button.textContent;
      setButtonLabel(button, textSpan, 'Subscribing\u2026', true);
      clearMessage(messageEl);

      // Get tag if present
      const tagInput = form.querySelector('input[name="tag"]');
      const tag = tagInput && tagInput.value ? tagInput.value : '';

      try {
        const response = await fetch('/.netlify/functions/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, tag }),
        });

        if (response.ok || response.status === 201) {
          showMessage(messageEl, 'success', MSG_SUCCESS);
          disableForm(emailInput, button);
        } else {
          showMessage(messageEl, 'error', MSG_ERROR);
          button.disabled = false;
          setButtonLabel(button, textSpan, originalText);
        }
      } catch {
        showMessage(messageEl, 'error', MSG_ERROR);
        button.disabled = false;
        setButtonLabel(button, textSpan, originalText);
      }

      messageEl.focus();
    });
  });

  function disableForm(emailInput, button) {
    emailInput.disabled = true;
    emailInput.value = '';
    button.disabled = true;
    const textSpan = button.querySelector('.newsletter-button-text');
    setButtonLabel(button, textSpan, 'Subscribed', true);
  }

  function showMessage(el, type, html) {
    el.innerHTML = html;
    el.className = 'newsletter-message ' + type;
    el.setAttribute('tabindex', '-1');
  }

  function clearMessage(el) {
    el.innerHTML = '';
    el.className = 'newsletter-message';
    el.removeAttribute('tabindex');
  }

  // Update button label. When showText is true (loading/success),
  // force the text visible and hide the icon on mobile.
  // When false (reset to default), restore icon-only mobile behavior.
  function setButtonLabel(button, textSpan, label, showText) {
    if (textSpan) {
      textSpan.textContent = label;
      if (showText) {
        button.classList.add('newsletter-button--has-label');
      } else {
        button.classList.remove('newsletter-button--has-label');
      }
    } else {
      button.textContent = label;
    }
  }
});
