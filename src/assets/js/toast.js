/**
 * Toast Notification System
 * Displays temporary messages to users
 */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Toast type: 'info', 'success', 'warning', or 'error'
 * @param {number} duration - How long to show the toast in milliseconds (default: 5000)
 */
function showToast(message, type = 'info', duration = 5000) {
  // Get or create toast container
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  // Add icon based on type
  const icon = getIconForType(type);

  // Build toast content
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close" aria-label="Close notification">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="16" height="16" fill="currentColor">
        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
      </svg>
    </button>
  `;

  // Add close button handler
  const closeButton = toast.querySelector('.toast-close');
  closeButton.addEventListener('click', () => {
    removeToast(toast);
  });

  // Add toast to container with animation
  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
  });

  // Auto-remove after duration
  const timeoutId = setTimeout(() => {
    removeToast(toast);
  }, duration);

  // Store timeout ID so we can clear it if manually closed
  toast.dataset.timeoutId = timeoutId;
}

/**
 * Remove a toast with animation
 * @param {HTMLElement} toast - The toast element to remove
 */
function removeToast(toast) {
  // Clear auto-dismiss timeout
  if (toast.dataset.timeoutId) {
    clearTimeout(parseInt(toast.dataset.timeoutId));
  }

  // Animate out
  toast.classList.remove('toast-show');
  toast.classList.add('toast-hide');

  // Remove from DOM after animation
  setTimeout(() => {
    toast.remove();

    // Remove container if empty
    const container = document.getElementById('toast-container');
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 300);
}

/**
 * Get icon SVG for toast type
 * Uses Phosphor Icons (from @phosphor-icons/core)
 * Icon mapping: info, check-circle, warning-circle, x-circle
 * @param {string} type - Toast type
 * @returns {string} SVG icon HTML
 */
function getIconForType(type) {
  const icons = {
    // Phosphor: info
    info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"/></svg>',
    // Phosphor: check-circle
    success: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20" fill="currentColor"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>',
    // Phosphor: warning-circle
    warning: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20" fill="currentColor"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"/></svg>',
    // Phosphor: x-circle
    error: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20" fill="currentColor"><path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>'
  };

  return icons[type] || icons.info;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { showToast };
}
