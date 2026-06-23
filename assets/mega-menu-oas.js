/**
 * OAS-Style Mega Menu — Custom Element
 * Hover-based mega menu with 3-column layout
 * Handles: open/close with intent delay, active item switching, video playback, keyboard nav
 */
class MegaMenuOas extends HTMLElement {
  constructor() {
    super();
    this.trigger = this.querySelector('.oas-mega__trigger');
    this.panel = this.querySelector('.oas-mega__panel');
    this.contentArea = this.panel ? this.panel.querySelector('.oas-mega__content') : null;
    this.leftItems = this.querySelectorAll('.oas-mega__left-item');
    this.subPanels = this.querySelectorAll('.oas-mega__sub-panel');
    this.mediaPanels = this.querySelectorAll('.oas-mega__media-panel');

    this.openDelay = 150;
    this.closeDelay = 300;
    this.openTimer = null;
    this.closeTimer = null;
    this.isOpen = false;
  }

  connectedCallback() {
    if (!this.trigger || !this.panel) return;

    // Hover on trigger to open
    this.trigger.addEventListener('mouseenter', this.scheduleOpen.bind(this));
    this.trigger.addEventListener('mouseleave', this.scheduleClose.bind(this));

    // Keyboard focus on trigger
    this.trigger.addEventListener('focus', this.scheduleOpen.bind(this));
    this.trigger.addEventListener('blur', () => {
      setTimeout(() => {
        if (!this.contains(document.activeElement)) this.close();
      }, 100);
    });

    // Keep open while hovering the content area
    if (this.contentArea) {
      this.contentArea.addEventListener('mouseenter', this.cancelClose.bind(this));
      this.contentArea.addEventListener('mouseleave', this.scheduleClose.bind(this));
    }

    // Left column item hover — switch active content
    this.leftItems.forEach(item => {
      item.addEventListener('mouseenter', () => this.activateItem(item));
    });

    // Keyboard: Escape to close
    this.keydownHandler = this.handleKeydown.bind(this);
    document.addEventListener('keydown', this.keydownHandler);

    // Click on backdrop to close
    const backdrop = this.panel.querySelector('.oas-mega__backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.close());
    }

    // Initialize: set aria attributes
    this.trigger.setAttribute('aria-expanded', 'false');
    this.panel.setAttribute('aria-hidden', 'true');
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.keydownHandler);
  }

  scheduleOpen() {
    clearTimeout(this.closeTimer);
    this.openTimer = setTimeout(() => this.open(), this.openDelay);
  }

  scheduleClose() {
    clearTimeout(this.openTimer);
    this.closeTimer = setTimeout(() => this.close(), this.closeDelay);
  }

  cancelClose() {
    clearTimeout(this.closeTimer);
    clearTimeout(this.openTimer);
  }

  handleKeydown(e) {
    if (e.key === 'Escape' && this.isOpen) {
      this.close();
      this.trigger.focus();
    }
  }

  open() {
    if (this.isOpen) return;

    // Close any other open mega menus
    document.querySelectorAll('mega-menu-oas').forEach(menu => {
      if (menu !== this && menu.isOpen) menu.close();
    });

    this.isOpen = true;
    this.panel.classList.add('is-open');
    this.panel.setAttribute('aria-hidden', 'false');
    this.trigger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('oas-mega-open');

    // Prevent sticky header from hiding while menu is open
    const headerWrapper = document.querySelector('.header-wrapper');
    if (headerWrapper) headerWrapper.preventHide = true;

    // Set header bottom position for max-height calc
    if (document.documentElement.style.getPropertyValue('--header-bottom-position-desktop') === '') {
      const header = document.querySelector('.header-wrapper');
      if (header) {
        document.documentElement.style.setProperty(
          '--header-bottom-position-desktop',
          `${Math.floor(header.getBoundingClientRect().bottom)}px`
        );
      }
    }

    // Play video in the active media panel
    this.playActiveVideo();
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.panel.classList.remove('is-open');
    this.panel.setAttribute('aria-hidden', 'true');
    this.trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('oas-mega-open');

    const headerWrapper = document.querySelector('.header-wrapper');
    if (headerWrapper) headerWrapper.preventHide = false;

    // Pause all videos
    this.panel.querySelectorAll('video').forEach(v => {
      v.pause();
    });
  }

  activateItem(item) {
    const target = item.dataset.target;

    // Update left column active state
    this.leftItems.forEach(i => i.classList.remove('is-active'));
    item.classList.add('is-active');

    // Update middle column: show matching sub-panel
    this.subPanels.forEach(p => p.classList.remove('is-active'));
    const subPanel = this.panel.querySelector(`.oas-mega__sub-panel[data-content="${target}"]`);
    if (subPanel) subPanel.classList.add('is-active');

    // Update right column: show matching media, play video
    this.mediaPanels.forEach(p => {
      p.classList.remove('is-active');
      const vid = p.querySelector('video');
      if (vid) vid.pause();
    });
    const mediaPanel = this.panel.querySelector(`.oas-mega__media-panel[data-media="${target}"]`);
    if (mediaPanel) {
      mediaPanel.classList.add('is-active');
      const vid = mediaPanel.querySelector('video');
      if (vid) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      }
    }
  }

  playActiveVideo() {
    // Pause all, then play only the active one
    this.panel.querySelectorAll('video').forEach(v => v.pause());
    const activeMedia = this.panel.querySelector('.oas-mega__media-panel.is-active video');
    if (activeMedia) {
      activeMedia.play().catch(() => {});
    }
  }
}

customElements.define('mega-menu-oas', MegaMenuOas);
