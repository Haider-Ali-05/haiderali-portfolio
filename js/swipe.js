/**
 * Mobile Swipe Navigation
 * Allows horizontal swipe between main sections on mobile devices.
 * Also fixes touch UX for chat pills, project filters, etc.
 */

export function initMobileSwipe() {
  // Only activate on touch devices
  if (!('ontouchstart' in window)) return;

  const sections = Array.from(
    document.querySelectorAll('main > section[id], main > div[id]')
  ).filter(s => s.id); // only sections with an ID

  if (sections.length === 0) return;

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let isSwiping = false;

  const SWIPE_THRESHOLD = 60;    // min horizontal px to count as swipe
  const SWIPE_TIME_LIMIT = 400;  // ms — faster = intentional swipe
  const ANGLE_THRESHOLD = 35;    // max degrees from horizontal allowed

  document.addEventListener('touchstart', (e) => {
    // Ignore if inside a scrollable container (chat, filters, etc.)
    if (isInsideScrollable(e.target)) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
    isSwiping = true;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isSwiping) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    // If user is clearly scrolling vertically, cancel swipe tracking
    if (dy > dx * 1.5) {
      isSwiping = false;
    }
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    isSwiping = false;

    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const dt = Date.now() - touchStartTime;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Reject if not fast enough, not far enough, or too vertical
    if (dt > SWIPE_TIME_LIMIT) return;
    if (absDx < SWIPE_THRESHOLD) return;
    const angle = Math.atan2(absDy, absDx) * (180 / Math.PI);
    if (angle > ANGLE_THRESHOLD) return;

    // Find which section is currently most visible
    const currentIndex = getCurrentSectionIndex(sections);
    if (currentIndex === -1) return;

    // Swipe left (dx < 0) → go to NEXT section
    // Swipe right (dx > 0) → go to PREVIOUS section
    let targetIndex;
    if (dx < 0) {
      targetIndex = Math.min(currentIndex + 1, sections.length - 1);
    } else {
      targetIndex = Math.max(currentIndex - 1, 0);
    }

    if (targetIndex !== currentIndex) {
      navigateToSection(sections[targetIndex]);
      showSwipeIndicator(dx < 0 ? 'next' : 'prev');
    }
  }, { passive: true });
}

function getCurrentSectionIndex(sections) {
  const viewportMid = window.scrollY + window.innerHeight * 0.4;
  let closest = 0;
  let closestDist = Infinity;

  sections.forEach((section, index) => {
    const sectionTop = section.offsetTop;
    const dist = Math.abs(sectionTop - viewportMid);
    if (dist < closestDist) {
      closestDist = dist;
      closest = index;
    }
  });

  return closest;
}

function navigateToSection(section) {
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function isInsideScrollable(el) {
  // Don't trigger swipe when user is swiping inside overflow-x: auto containers
  const scrollableSelectors = [
    '.project-filters',
    '.chat-suggestion-pills',
    '.github-heatmap-wrapper',
    '.nexus-chat-popup',
    '.chat-messages',
  ];
  return scrollableSelectors.some(sel => el.closest(sel));
}

// Brief toast-style arrow indicator at bottom of screen
let indicatorTimeout = null;
function showSwipeIndicator(direction) {
  let indicator = document.getElementById('swipe-indicator');
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'swipe-indicator';
    document.body.appendChild(indicator);
  }

  clearTimeout(indicatorTimeout);
  indicator.textContent = direction === 'next' ? '→ Next Section' : '← Prev Section';
  indicator.classList.add('visible');
  indicatorTimeout = setTimeout(() => {
    indicator.classList.remove('visible');
  }, 1000);
}
