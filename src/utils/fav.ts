export const func_fav = () => {
  // Array of favicon URLs (replace these with your own links)
  const favicons = [
    'https://cdn.prod.website-files.com/66d705e00cbf9913ba1c539b/6788356d2480c4c990e30d02_1.png',
    'https://cdn.prod.website-files.com/66d705e00cbf9913ba1c539b/678835807fc92b0b8ee0c0c0_2.png',
    'https://cdn.prod.website-files.com/66d705e00cbf9913ba1c539b/67883580c0e6b74286e48dce_3.png',
    'https://cdn.prod.website-files.com/66d705e00cbf9913ba1c539b/67883580605d94a89c8a421f_4.png',
    'https://cdn.prod.website-files.com/66d705e00cbf9913ba1c539b/67883580758eac19b94e925c_5.png',
    'https://cdn.prod.website-files.com/66d705e00cbf9913ba1c539b/678835805259a4d654fc3572_6.png',
    'https://cdn.prod.website-files.com/66d705e00cbf9913ba1c539b/67883580aede649838e66424_7.png',
  ];

  // Function to change the favicon
  function changeFavicon(iconURL) {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = iconURL;
  }

  // Function to calculate scroll percentage and update favicon
  function updateFaviconOnScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    // Determine which favicon to show based on scroll percentage
    const index = Math.min(
      Math.floor((scrollPercent / 100) * favicons.length),
      favicons.length - 1
    );

    changeFavicon(favicons[index]);
  }

  // Event listener for scroll
  window.addEventListener('scroll', updateFaviconOnScroll);

  // Initial favicon update in case the page is loaded mid-scroll
  updateFaviconOnScroll();
};
