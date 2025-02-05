// export const func_portfolioObserver = () => {
//   const video = document.getElementById('myVideo');
//   const handleEl = document.querySelector('[aria-valuenow]');
//   if (!video || !handleEl) return;
//   const updateTime = () => {
//     const val = Number(handleEl.getAttribute('aria-valuenow')) || 0;
//     if (video.readyState > 0) {
//       video.currentTime = (val / 1000) * video.duration;
//     } else {
//       video.addEventListener('loadedmetadata', function onLoaded() {
//         video.removeEventListener('loadedmetadata', onLoaded);
//         video.currentTime = (val / 1000) * video.duration;
//       });
//     }
//   };
//   updateTime();
//   const observer = new MutationObserver(() => {
//     updateTime();
//   });
//   observer.observe(handleEl, { attributes: true, attributeFilter: ['aria-valuenow'] });
// };
