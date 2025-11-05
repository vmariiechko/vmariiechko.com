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
 * @param {string} postSlug - The post identifier
 * @param {string} action - The action type ('like' or 'unlike')
 */
function trackLikeEvent(postSlug, action) {
  // Check if Umami is loaded (it's async, so may not be available immediately)
  console.log('Umami loaded:', typeof window.umami !== 'undefined');
  if (typeof window.umami !== 'undefined') {
    console.log('Tracking like event for post:', postSlug, 'Action:', action);
    window.umami.track('post_liked', {
      slug: postSlug,
      action: action,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Update the like button UI state
 * @param {HTMLButtonElement} button - The like button element
 * @param {boolean} liked - Whether the post is liked
 */
function updateButtonState(button, liked) {
  const heartIcon = button.querySelector('.like-heart');
  const labelText = button.querySelector('.like-label');

  if (liked) {
    // Post is liked - show filled heart
    heartIcon.setAttribute('data-weight', 'fill');
    heartIcon.classList.add('liked');
    button.setAttribute('aria-pressed', 'true');
    button.setAttribute('title', 'Unlike this post');
    if (labelText) {
      labelText.textContent = 'Liked';
    }
  } else {
    // Post is not liked - show regular heart
    heartIcon.setAttribute('data-weight', 'regular');
    heartIcon.classList.remove('liked');
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
