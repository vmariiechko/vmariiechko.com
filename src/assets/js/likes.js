/**
 * Like Button Functionality
 * Stores liked posts in localStorage and tracks engagement via Umami Analytics
 */

const STORAGE_KEY = 'liked_posts';

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
 */
function trackLikeEvent(postSlug, action) {
  // Attempt to track, with retries if Umami hasn't loaded yet
  const attemptTrack = (retriesLeft = 3, delay = 500) => {
    console.log(`[Likes] Attempt ${4 - retriesLeft}/3 - Track event:`, postSlug, action);

    // Check if Umami is loaded and has the track function
    const umamiLoaded = typeof window.umami !== 'undefined';
    const umamiTrackAvailable = umamiLoaded && typeof window.umami.track === 'function';

    console.log('[Likes] Umami loaded:', umamiLoaded);
    console.log('[Likes] Umami track function available:', umamiTrackAvailable);

    if (umamiTrackAvailable) {
      // Umami is loaded and ready
      console.log('[Likes] ✓ Tracking event in Umami');
      try {
        window.umami.track('post_liked', {
          slug: postSlug,
          action: action,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.warn('[Likes] Failed to track like event:', error);
      }
    } else if (retriesLeft > 0) {
      // Umami not ready yet, retry after delay
      console.log(`[Likes] Umami not ready, retrying in ${delay}ms (${retriesLeft} retries left)`);
      setTimeout(() => attemptTrack(retriesLeft - 1, delay), delay);
    } else {
      // All retries exhausted
      console.log('[Likes] All retries exhausted. Umami not available (ad blocker or DNT)');
    }
  };

  attemptTrack();
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
    button.setAttribute('title', 'Unlike this post');
    if (labelText) {
      labelText.textContent = 'Liked';
    }
  } else {
    // Post is not liked - show outline heart
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('title', 'Like this post');
    if (labelText) {
      labelText.textContent = 'Like this post';
    }
  }
}

/**
 * Toggle like state for a post
 * @param {string} postSlug - The post identifier
 * @param {HTMLButtonElement} button - The like button element
 */
function toggleLike(postSlug, button) {
  const likedPosts = getLikedPosts();
  const isLiked = likedPosts.includes(postSlug);

  if (isLiked) {
    // Unlike: remove from array
    const index = likedPosts.indexOf(postSlug);
    if (index > -1) {
      likedPosts.splice(index, 1);
    }
    saveLikedPosts(likedPosts);
    updateButtonState(button, false);
    trackLikeEvent(postSlug, 'unlike');
  } else {
    // Like: add to array
    likedPosts.push(postSlug);
    saveLikedPosts(likedPosts);
    updateButtonState(button, true);
    trackLikeEvent(postSlug, 'like');

    // Optional: Add subtle animation feedback
    button.classList.add('like-animation');
    setTimeout(() => {
      button.classList.remove('like-animation');
    }, 600);
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
