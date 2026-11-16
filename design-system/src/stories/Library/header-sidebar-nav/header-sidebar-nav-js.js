window.addEventListener("load", () => {
  const sidebarNavToggle = document.getElementById(
    "header-sidebar-nav__toggle",
  );
  const sidebarNav = document.querySelector(".header-sidebar-nav");

  if (!sidebarNav) {
    return;
  }

  const backgroundWrapper = sidebarNav.querySelector(
    ".header-sidebar-nav__background-wrapper",
  );

  // Safari and Firefox hide a closed dialog at once, so slide the menu out
  // before calling close(). getAnimations() only lists the dialog's own
  // transition and is empty when nothing animates. The timeout covers
  // animations that never finish, e.g. in a background tab.
  function closeSidebarNav() {
    if (!sidebarNav.open || sidebarNav.hasAttribute("data-closing")) {
      return;
    }
    sidebarNav.setAttribute("data-closing", "");
    Promise.race([
      Promise.allSettled(
        sidebarNav.getAnimations().map((animation) => animation.finished),
      ),
      new Promise((resolve) => {
        setTimeout(resolve, 500);
      }),
    ]).then(() => {
      // Skip if the menu was already closed meanwhile, e.g. by a second Escape.
      if (sidebarNav.hasAttribute("data-closing")) {
        sidebarNav.close();
      }
    });
  }

  // showModal() makes the rest of the page inert, so screen readers and
  // keyboard users can't reach content behind the open menu.
  sidebarNavToggle?.addEventListener("click", () => {
    sidebarNav.showModal();
    sidebarNavToggle.setAttribute("aria-expanded", "true");
  });

  // Escape. Browsers may refuse to let us cancel it (e.g. a second Escape
  // without user activation); then the dialog closes at once.
  sidebarNav.addEventListener("cancel", (event) => {
    if (event.cancelable) {
      event.preventDefault();
      closeSidebarNav();
    }
  });

  sidebarNav.addEventListener("close", () => {
    sidebarNav.removeAttribute("data-closing");
    sidebarNavToggle?.setAttribute("aria-expanded", "false");
    sidebarNavToggle?.focus();
  });

  // A menu link leaves the page while the menu is still sliding out. Close it
  // at once, so the page doesn't come back from the back/forward cache with
  // the menu open and the rest of the page inert.
  window.addEventListener("pagehide", () => sidebarNav.close());

  sidebarNav.addEventListener("click", (event) => {
    if (
      event.target === backgroundWrapper ||
      event.target.closest(
        "#js-header-sidebar-nav__close-menu-button, .header__menu-navigation-item a",
      )
    ) {
      closeSidebarNav();
    }
  });
});
