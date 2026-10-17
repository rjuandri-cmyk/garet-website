(() => {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const copyButton = document.getElementById('copyContract');
  const address = document.getElementById('contractAddress');
  const message = document.getElementById('copyMessage');
  if (copyButton && address) {
    copyButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(address.textContent.trim());
        message.textContent = 'Contract address copied.';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(address);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        message.textContent = 'Select and copy the highlighted address manually.';
      }
    });
  }
})();
