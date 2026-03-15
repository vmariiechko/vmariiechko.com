/**
 * Brick Easter Egg — gravity-stack "Tetris wall" anchored to page bottom.
 * Bricks stack from the bottom up. Discovered by scrolling to the footer.
 * Count = published content items (capped at 100). Every 10th = milestone brick.
 */
(function () {
  var field = document.querySelector('.brick-field');
  if (!field) return;

  var count = Math.min(parseInt(field.dataset.count, 10) || 0, 100);
  if (!count) return;

  var BRICK_W = 40;
  var BRICK_H = 37;                // preserves WebP aspect ratio (1479:1359)
  var BRICK_COL_W = BRICK_W + 2;  // slot width (2px gap between columns)
  var BRICK_STACK_GAP = 1;         // vertical gap between bricks in same column

  function buildWall() {
    field.innerHTML = '';

    var vw = window.innerWidth;
    var numSlots = Math.floor(vw / BRICK_COL_W);
    if (numSlots < 1) return;

    // Margin boundaries (used for the "creep toward center" logic)
    var contentW = Math.min(928, vw); // 896 max-w-4xl + 32 padding
    var marginEnd = Math.floor((vw - contentW) / 2 / BRICK_COL_W); // left margin slot count
    var centerStart = numSlots - marginEnd;                          // right margin start slot

    // Per-slot stack heights (px from bottom)
    var heights = new Array(numSlots).fill(0);

    for (var b = 0; b < count; b++) {
      var col;

      if (b < marginEnd * 2 && marginEnd > 0) {
        // First bricks: only left/right margin columns — "creep" starts in margins
        var pool = [];
        for (var s = 0; s < marginEnd; s++) pool.push(s);
        for (var s = centerStart; s < numSlots; s++) pool.push(s);
        col = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)]
                               : Math.floor(Math.random() * numSlots);
      } else {
        // Remaining bricks: full width — creep fills toward center naturally
        col = Math.floor(Math.random() * numSlots);
      }

      var bx = col * BRICK_COL_W + (BRICK_COL_W - BRICK_W) / 2;
      var by = heights[col];

      var isMilestone = (b + 1) % 10 === 0;
      var div = document.createElement('div');
      div.className = isMilestone ? 'brick brick-milestone' : 'brick';
      div.style.left = Math.round(bx) + 'px';
      div.style.bottom = Math.round(by) + 'px';

      // Stagger: wave across x-axis, then additional delay per stack level
      var xFraction = col / (numSlots - 1 || 1);
      var stackLevel = Math.round(heights[col] / (BRICK_H + BRICK_STACK_GAP));
      var delayMs = Math.round(xFraction * 350) + stackLevel * 45;
      div.style.animationDelay = delayMs + 'ms';

      field.appendChild(div);
      heights[col] += BRICK_H + BRICK_STACK_GAP;
    }
  }

  // Build on load
  buildWall();

  // Scroll-to-discover: trigger settle animation when footer enters viewport
  function triggerAnimation() {
    field.classList.add('visible');
  }

  var footer = document.querySelector('footer');
  if (footer && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        triggerAnimation();
        io.disconnect();
      }
    }, { threshold: 0.1 });
    io.observe(footer);
  } else {
    triggerAnimation(); // fallback for old browsers or short pages
  }

  // Rebuild on resize (new random layout + re-trigger animation on next scroll)
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      field.classList.remove('visible');
      buildWall();

      var footer = document.querySelector('footer');
      if (footer && 'IntersectionObserver' in window) {
        var io2 = new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) {
            field.classList.add('visible');
            io2.disconnect();
          }
        }, { threshold: 0.1 });
        io2.observe(footer);
      } else {
        field.classList.add('visible');
      }
    }, 250);
  });
})();
