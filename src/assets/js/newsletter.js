document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.newsletter-form-inner');
  if (!forms.length) return;

  const MSG_SUCCESS = 'Almost there. Check your inbox to confirm, and new posts will land in your email.';
  const MSG_ERROR = 'Something went wrong. Try again, or grab the <a href="/feed.xml" class="newsletter-error-link">RSS feed</a> instead.';
  const MSG_TURNSTILE = 'Verification not ready yet. Please try again in a moment.';

  forms.forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = form.querySelector('input[name="email"]');
      const honeypot = form.querySelector('input[name="url"]');
      const button = form.querySelector('.newsletter-button');
      const messageEl = form.closest('.newsletter-form').querySelector('.newsletter-message');
      const username = form.dataset.username;

      // Honeypot check: if filled, silently "succeed" — don't reveal to bot
      if (honeypot && honeypot.value) {
        showMessage(messageEl, 'success', MSG_SUCCESS);
        disableForm(form, emailInput, button);
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

      // Require Turnstile token if widget is present
      const turnstileWidget = form.querySelector('.cf-turnstile');
      let turnstileToken = getTurnstileToken(form);

      if (turnstileWidget && !turnstileToken) {
        turnstileToken = await waitForTurnstileToken(form, 3000);
      }

      if (turnstileWidget && !turnstileToken) {
        showMessage(messageEl, 'error', MSG_TURNSTILE);
        button.disabled = false;
        setButtonLabel(button, textSpan, originalText);
        messageEl.focus();
        return;
      }

      // Build form data
      const body = new URLSearchParams({ email });
      const tagInput = form.querySelector('input[name="tag"]');
      if (tagInput && tagInput.value) {
        body.set('tag', tagInput.value);
      }
      if (turnstileToken) {
        body.set('cf-turnstile-response', turnstileToken);
      }

      try {
        const response = await fetch(
          `https://buttondown.com/api/emails/embed-subscribe/${username}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
          }
        );

        if (response.ok || response.status === 201) {
          showMessage(messageEl, 'success', MSG_SUCCESS);
          disableForm(form, emailInput, button);
        } else {
          showMessage(messageEl, 'error', MSG_ERROR);
          button.disabled = false;
          setButtonLabel(button, textSpan, originalText);

          if (turnstileWidget && window.turnstile) {
            turnstile.reset(turnstileWidget);
          }
        }
      } catch {
        showMessage(messageEl, 'error', MSG_ERROR);
        button.disabled = false;
        setButtonLabel(button, textSpan, originalText);

        if (turnstileWidget && window.turnstile) {
          turnstile.reset(turnstileWidget);
        }
      }

      messageEl.focus();
    });
  });

  function disableForm(form, emailInput, button) {
    emailInput.disabled = true;
    emailInput.value = '';
    button.disabled = true;
    const textSpan = button.querySelector('.newsletter-button-text');
    setButtonLabel(button, textSpan, 'Subscribed', true);

    // Hide Turnstile — no further submissions needed
    const turnstileWidget = form.querySelector('.cf-turnstile');
    if (turnstileWidget) {
      turnstileWidget.style.display = 'none';
    }
  }

  function getTurnstileToken(form) {
    const input = form.querySelector('[name="cf-turnstile-response"]');
    return input && input.value ? input.value : null;
  }

  function waitForTurnstileToken(form, timeoutMs) {
    return new Promise((resolve) => {
      const interval = 200;
      let elapsed = 0;

      const check = () => {
        const token = getTurnstileToken(form);
        if (token) {
          resolve(token);
          return;
        }
        elapsed += interval;
        if (elapsed >= timeoutMs) {
          resolve(null);
          return;
        }
        setTimeout(check, interval);
      };

      check();
    });
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
