const currencyRates = {
    EUR: 1,
    USD: 1.08,
    GBP: 0.86,
  };
  
  let selectedCurrency = 'EUR';
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  function getCurrencyFromCountry(countryCode) {
    const map = {
      DE: 'EUR',
      AT: 'EUR',
      CH: 'EUR',
      US: 'USD',
      GB: 'GBP',
      FR: 'EUR',
      NL: 'EUR',
      ES: 'EUR',
      IT: 'EUR',
    };
    return map[countryCode] || 'EUR';
  }
  
  function fetchUserCurrency() {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        const countryCurrency = getCurrencyFromCountry(data.country);
        if (countryCurrency) {
          selectedCurrency = countryCurrency;
          const selector = document.getElementById('currency-selector');
          if (selector) selector.value = selectedCurrency;
          updatePrices();
          updateCartPrices();
        }
      })
      .catch((err) => {
        console.error('Geo-IP Error:', err);
      });
  }
  
  function updatePrices() {
    const priceElements = document.querySelectorAll('.product-price');
    priceElements.forEach((el) => {
      const basePrice = parseFloat(el.getAttribute('data-base-price'));
      const converted = basePrice * currencyRates[selectedCurrency];
      let symbol = '€';
      if (selectedCurrency === 'USD') symbol = '$';
      if (selectedCurrency === 'GBP') symbol = '£';
      el.textContent = `${converted.toFixed(2)} ${symbol}`;
    });
  }
  
  
  function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) cartCount.textContent = cart.length;
  }
  
  function updateCartPrices() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('cart-total');
    function updateCartPrices() {
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        const cartContainer = document.getElementById('cart-items');
        const totalDisplay = document.getElementById('cart-total');
        if (!cartContainer || !totalDisplay) return;
      
        cartContainer.innerHTML = '';
        let total = 0;
      
        cartItems.forEach(item => {
          const priceInEUR = parseFloat(item.price);
          const convertedPrice = (priceInEUR * currencyRates[selectedCurrency]).toFixed(2);
          total += parseFloat(convertedPrice);
      
          const itemDiv = document.createElement('div');
          itemDiv.classList.add('cart-item');
          itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div>
              <h4>${item.name}</h4>
              <p>${convertedPrice} ${selectedCurrency}</p>
              <button class="remove-item" data-name="${item.name}">Entfernen</button>
            </div>
          `;
          cartContainer.appendChild(itemDiv);
        });
      
        // Versandkosten basierend auf Geo-IP
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(data => {
            const countryCode = data.country;
            const shippingBase = shippingCostsByCountry[countryCode] || 5.90;
            const shippingConverted = (shippingBase * currencyRates[selectedCurrency]).toFixed(2);
            total += parseFloat(shippingConverted);
      
            totalDisplay.textContent = `Gesamt: ${total.toFixed(2)} ${selectedCurrency} (inkl. Versand: ${shippingConverted} ${selectedCurrency})`;
          });
      }
      
  
    if (!cartContainer || !totalDisplay) return;
  
    cartContainer.innerHTML = '';
    let total = 0;
  
    cartItems.forEach((item) => {
      const priceInEUR = parseFloat(item.price);
      const convertedPrice = (priceInEUR * currencyRates[selectedCurrency]).toFixed(2);
      total += parseFloat(convertedPrice);
  
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('cart-item');
      itemDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h4>${item.name}</h4>
          <p>${convertedPrice} ${selectedCurrency}</p>
          <button class="remove-item" data-name="${item.name}">Entfernen</button>
        </div>
      `;
      cartContainer.appendChild(itemDiv);
    });
  
    totalDisplay.textContent = `Gesamt: ${total.toFixed(2)} ${selectedCurrency}`;
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    fetchUserCurrency();
    updateCartCount();
    updateCartPrices();
  
    document.querySelectorAll('.btn-kaufen').forEach((button) => {
      button.addEventListener('click', () => {
        const name = button.getAttribute('data-name');
        const price = parseFloat(button.getAttribute('data-price').replace(',', '.'));
        const image = button.getAttribute('data-image');
  
        cart.push({ name, price, image });
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        alert(`${name} wurde in den Warenkorb gelegt!`);
      });
    });
  
    const selector = document.getElementById('currency-selector');
    if (selector) {
      selector.addEventListener('change', (e) => {
        selectedCurrency = e.target.value;
        updatePrices();
        updateCartPrices();
      });
    }
  });
  function detectBrowserLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    return lang.startsWith('de') ? 'de' : 'en';
  }
  
  function applyLanguage(lang) {
    const translations = {
      de: {
        shopNow: 'Jetzt shoppen',
        headline: 'Stylische T-Shirts. Kein Bullshit.',
        desc: 'Print-on-Demand. Direkt zu dir. Nachhaltig & edgy.',
        cartText: 'Gesamt',
      },
      en: {
        shopNow: 'Shop now',
        headline: 'Stylish T-shirts. No bullshit.',
        desc: 'Print-on-demand. Delivered to you. Sustainable & edgy.',
        cartText: 'Total',
      },
    };
  
    document.querySelector('.hero h2').textContent = translations[lang].headline;
    document.querySelector('.hero p').textContent = translations[lang].desc;
    document.querySelector('.btn').textContent = translations[lang].shopNow;
  
    const totalDisplay = document.getElementById('cart-total');
    if (totalDisplay) {
      const total = parseFloat(totalDisplay.textContent.match(/[\d\.]+/));
      totalDisplay.textContent = `${translations[lang].cartText}: ${total.toFixed(2)} ${selectedCurrency}`;
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const detectedLang = detectBrowserLanguage();
    document.getElementById('language-selector').value = detectedLang;
    applyLanguage(detectedLang);
  
    document.getElementById('language-selector').addEventListener('change', (e) => {
      applyLanguage(e.target.value);
    });
  });
  const shippingCostsByCountry = {
    DE: 4.90,
    AT: 5.90,
    CH: 7.90,
    US: 9.90,
    GB: 8.90,
    FR: 5.90,
    // ...
  };
// Theme toggle
const themeToggleBtn = document.getElementById('toggle-theme');
const root = document.documentElement;

function setTheme(theme) {
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    themeToggleBtn.textContent = '☀️';
  } else {
    root.setAttribute('data-theme', 'light');
    themeToggleBtn.textContent = '🌙';
  }
  localStorage.setItem('theme', theme);
}

// Initial Theme
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = root.getAttribute('data-theme');
  if (currentTheme === 'dark') setTheme('light');
  else setTheme('dark');
});
