/**
 * Like Button Functionality
 * Stores liked posts in localStorage and tracks engagement via Umami Analytics
 */

const STORAGE_KEY = 'liked_content';

/**
 * Get all liked post slugs from localStorage
 * @returns {string[]} Array of liked post slugs
 */
function getLikedPosts() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading liked posts from localStorage:', error);
    return [];
  }
}

/**
 * Save liked posts to localStorage
 * @param {string[]} posts - Array of post slugs
 */
function saveLikedPosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch (error) {
    console.error('Error saving liked posts to localStorage:', error);
  }
}

/**
 * Check if a post is liked
 * @param {string} postSlug - The post identifier
 * @returns {boolean} True if post is liked
 */
function isPostLiked(postSlug) {
  const likedPosts = getLikedPosts();
  return likedPosts.includes(postSlug);
}

/**
 * Track like event in Umami Analytics (if available)
 * Implements retry mechanism to handle async script loading
 * @param {string} postSlug - The post identifier
 * @param {string} action - The action type ('like' or 'unlike')
 * @returns {Promise<boolean>} Resolves to true if tracking succeeded, false if failed
 */
function trackLikeEvent(postSlug, action) {
  return new Promise((resolve) => {
    // Attempt to track, with retries if Umami hasn't loaded yet
    const attemptTrack = (retriesLeft = 3, delay = 100) => {
      // Check if Umami is loaded and has the track function
      const umamiLoaded = typeof window.umami !== 'undefined';
      const umamiTrackAvailable = umamiLoaded && typeof window.umami.track === 'function';

      if (umamiTrackAvailable) {
        // Umami is loaded and ready
        try {
          window.umami.track('content_liked', {
            slug: postSlug,
            action: action,
            timestamp: new Date().toISOString()
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
 * @param {boolean} liked - Whether the post is liked
 */
function updateButtonState(button, liked) {
  const labelText = button.querySelector('.like-label');

  if (liked) {
    // Post is liked - show filled heart (CSS handles icon swap via aria-pressed)
    button.setAttribute('aria-pressed', 'true');
    button.setAttribute('title', 'Unlike this content');
    if (labelText) {
      labelText.textContent = 'Liked';
    }
  } else {
    // Post is not liked - show outline heart
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('title', 'Like this content');
    if (labelText) {
      labelText.textContent = 'Like this content';
    }
  }
}

/**
 * Toggle like state for a post
 * @param {string} postSlug - The post identifier
 * @param {HTMLButtonElement} button - The like button element
 */
async function toggleLike(postSlug, button) {
  const likedPosts = getLikedPosts();
  const isLiked = likedPosts.includes(postSlug);

  if (isLiked) {
    // Unlike: track first, then remove from localStorage
    const tracked = await trackLikeEvent(postSlug, 'unlike');

    if (tracked) {
      const index = likedPosts.indexOf(postSlug);
      if (index > -1) {
        likedPosts.splice(index, 1);
      }
      saveLikedPosts(likedPosts);
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
    const tracked = await trackLikeEvent(postSlug, 'like');

    if (tracked) {
      likedPosts.push(postSlug);
      saveLikedPosts(likedPosts);
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
    const postSlug = button.getAttribute('data-post-slug');

    if (!postSlug) {
      console.warn('Like button found without data-post-slug attribute');
      return;
    }

    // Set initial state based on localStorage
    const isLiked = isPostLiked(postSlug);
    updateButtonState(button, isLiked);

    // Add click handler
    button.addEventListener('click', () => {
      toggleLike(postSlug, button);
    });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLikes);
} else {
  initializeLikes();
}
