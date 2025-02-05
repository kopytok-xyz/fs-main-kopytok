export const func_statsHero = () => {
  const all_func_statsHero = document.querySelectorAll('.card.is-hero-orange-section');
  if (all_func_statsHero.length) {
    fetch('https://dev.kopytok.xyz/site-stats')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Ошибка при получении данных');
        }
        return response.json();
      })
      .then((data) => {
        const totalStats = data['total-stats'];
        const rawSiteCount = parseFloat(String(totalStats['site-count']).replace('k', ''));
        if (!isNaN(rawSiteCount) && rawSiteCount > 0 && rawSiteCount < 78) {
          const factor = 78 / rawSiteCount;
          for (const key in totalStats) {
            const originalValue = String(totalStats[key]);
            const hasK = originalValue.includes('k');
            const numericValue = parseFloat(originalValue.replace('k', ''));
            if (!isNaN(numericValue)) {
              const multiplied = numericValue * factor;
              totalStats[key] = hasK ? `${Math.round(multiplied)}k` : Math.round(multiplied);
            }
          }
        }
        for (const key in totalStats) {
          const element = document.getElementById(key);
          if (element) {
            element.textContent = totalStats[key];
          }
        }
      })
      .catch((error) => {
        console.error('Ошибка:', error);
      });
  }
};
