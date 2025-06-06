import { func_buttonTextToggl } from '$utils/button-text-toggl';
import { func_collapseButtons } from '$utils/collapse-buttons';
import { func_collapsedClassHeightTransition } from '$utils/collapsed-class-height-transition';
import { func_faceWorksSimple } from '$utils/face-works-simple';
import { func_fav } from '$utils/fav';
import { func_portfolioWorksSimple } from '$utils/func-portfolio-works-simple';
import { func_global } from '$utils/global';
import { func_heightTransition } from '$utils/height-transition';
import { func_heroForm } from '$utils/hero-form';
import { func_mindConnectionsLeader } from '$utils/mind-connections-leader';
import { func_scrollMenuVisibility } from '$utils/scroll-menu-visibility';
import { initSmoothScroll } from '$utils/smooth-scroll';
import { func_statsHero } from '$utils/stats-hero';
import { func_syncClick } from '$utils/sync-click';
import { func_syncClickSection } from '$utils/sync-click-section-func';
import { func_testimonialsGrid } from '$utils/testimonials-grid';
import { func_togglClassTriggerTarget } from '$utils/toggl-class-trigger-target';
import { func_yearCounter } from '$utils/year-counter';

window.Webflow ||= [];
window.Webflow.push(() => {
  func_global();
  func_faceWorksSimple();
  func_portfolioWorksSimple();
  func_heroForm();
  // func_collapseButtons();
  // func_heightTransition();
  // func_syncClick();
  // func_buttonTextToggl();
  func_statsHero();
  func_yearCounter();
  // func_togglClassTriggerTarget();
  func_mindConnectionsLeader();
  func_testimonialsGrid();
  func_fav();
  func_syncClickSection();
  // func_collapsedClassHeightTransition();
  func_scrollMenuVisibility();

  // Инициализация плавного скролла
  //initSmoothScroll();
});
