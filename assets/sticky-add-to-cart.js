document.addEventListener('DOMContentLoaded', () => {
  const sticky = document.getElementById('sticky-add-to-cart');
  const productForm = document.querySelector('form[role="main"]');
  const addBtn = document.getElementById('sticky-add-btn');
  const priceElem = document.querySelector('[data-product-price]');

  if (!productForm) return;

  // Show sticky when scrolled past original button
  window.addEventListener('scroll', () => {
    const rect = productForm.getBoundingClientRect();
    sticky.style.display = (rect.bottom < 0) ? 'block' : 'none';
  });

  // Add to cart
  addBtn.addEventListener('click', () => {
    const formData = new FormData(productForm);
    fetch('/cart/add.js', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(() => alert('Added to cart!'));
  });

  // Sync price
  if (priceElem) {
    document.getElementById('sticky-price').textContent = priceElem.textContent;
  }
});
