/**
 * Like Button Functionality
 * Stores liked content in localStorage and tracks engagement via Umami Analytics
 * Supports both posts and short bytes
 */

const STORAGE_KEY = 'liked_content';

/**
 * Get all liked content slugs from localStorage
 * @returns {string[]} Array of liked content slugs
 */
function getLikedContent() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading liked content from localStorage:', error);
    return [];
  }
}

/**
 * Save liked content to localStorage
 * @param {string[]} content - Array of content slugs
 */
function saveLikedContent(content) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  } catch (error) {
    console.error('Error saving liked content to localStorage:', error);
  }
}

/**
 * Check if a content is liked
 * @param {string} contentSlug - The content identifier
 * @returns {boolean} True if content is liked
 */
function isContentLiked(contentSlug) {
  const likedContent = getLikedContent();
  return likedContent.includes(contentSlug);
}

/**
 * Track like event in Umami Analytics (if available)
 * Implements retry mechanism to handle async script loading
 * Uses separate event names for cleaner analytics
 * @param {string} contentSlug - The content identifier
 * @param {string} contentType - The content type
 * @param {string} action - The action type ('like' or 'unlike')
 * @returns {Promise<boolean>} Resolves to true if tracking succeeded, false if failed
 */
function trackLikeEvent(contentSlug, contentType, action) {
  return new Promise((resolve) => {
    // Attempt to track, with retries if Umami hasn't loaded yet
    const attemptTrack = (retriesLeft = 3, delay = 100) => {
      // Check if Umami is loaded and has the track function
      const umamiLoaded = typeof window.umami !== 'undefined';
      const umamiTrackAvailable = umamiLoaded && typeof window.umami.track === 'function';

      if (umamiTrackAvailable) {
        // Umami is loaded and ready
        try {
          // Use separate event names for likes and unlikes
          const eventName = action === 'like' ? 'content_liked' : 'content_unliked';

          window.umami.track(eventName, {
            slug: contentSlug,
            type: contentType
          });
          resolve(true); // Tracking succeeded
        } catch (error) {
          console.warn('Failed to track like event:', error);
          resolve(false); // Tracking failed
        }
      } else if (retriesLeft > 0) {
        // Umami not ready yet, retry after delay
        setTimeout(() => attemptTrack(retriesLeft - 1, delay), delay);
      } else {
        // All retries exhausted - likely ad blocker
        resolve(false); // Tracking failed
      }
    };

    attemptTrack();
  });
}

/**
 * Update the like button UI state
 * @param {HTMLButtonElement} button - The like button element
 * @param {boolean} liked - Whether the content is liked
 */
function updateButtonState(button, liked) {
  const labelText = button.querySelector('.like-label');

  if (liked) {
    // Content is liked - show filled heart (CSS handles icon swap via aria-pressed)
    button.setAttribute('aria-pressed', 'true');
    button.setAttribute('title', 'Unlike this content');
    if (labelText) {
      labelText.textContent = 'Liked';
    }
  } else {
    // Content is not liked - show outline heart
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('title', 'Like this content');
    if (labelText) {
      labelText.textContent = 'Like this content';
    }
  }
}

/**
 * Toggle like state for a content
 * @param {string} contentSlug - The content identifier
 * @param {string} contentType - The content type
 * @param {HTMLButtonElement} button - The like button element
 */
async function toggleLike(contentSlug, contentType, button) {
  const likedContent = getLikedContent();
  const isLiked = likedContent.includes(contentSlug);

  if (isLiked) {
    // Unlike: track first, then remove from localStorage
    const tracked = await trackLikeEvent(contentSlug, contentType, 'unlike');

    if (tracked) {
      const index = likedContent.indexOf(contentSlug);
      if (index > -1) {
        likedContent.splice(index, 1);
      }
      saveLikedContent(likedContent);
      updateButtonState(button, false);
    } else {
      // Tracking failed - show toast and don't unlike
      if (typeof showToast === 'function') {
        showToast(
          'Unable to track your interaction.<br>Please disable your ad blocker to support the author with engagement metrics.',
          'error',
          6000
        );
      }
    }
  } else {
    // Like: track first, then add to localStorage
    const tracked = await trackLikeEvent(contentSlug, contentType, 'like');

    if (tracked) {
      likedContent.push(contentSlug);
      saveLikedContent(likedContent);
      updateButtonState(button, true);

      // Add subtle animation feedback
      button.classList.add('like-animation');
      setTimeout(() => {
        button.classList.remove('like-animation');
      }, 600);
    } else {
      // Tracking failed - show toast and don't save like
      if (typeof showToast === 'function') {
        showToast(
          'Unable to track your interaction.<br>Please disable your ad blocker to support the author with engagement metrics.',
          'error',
          6000
        );
      }
    }
  }
}

/**
 * Initialize like buttons on the page
 */
function initializeLikes() {
  const likeButtons = document.querySelectorAll('[data-like-button]');

  likeButtons.forEach(button => {
    const contentSlug = button.getAttribute('data-content-slug');
    const contentType = button.getAttribute('data-content-type');

    if (!contentSlug) {
      console.warn('Like button found without data-content-slug attribute');
      return;
    }

    // Set initial state based on localStorage
    const isLiked = isContentLiked(contentSlug);
    updateButtonState(button, isLiked);

    // Add click handler
    button.addEventListener('click', () => {
      toggleLike(contentSlug, contentType, button);
    });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLikes);
} else {
  initializeLikes();
}
