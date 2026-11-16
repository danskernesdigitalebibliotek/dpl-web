window.addEventListener("load", () => {
  const sidebarNavToggle = document.getElementById(
    "header-sidebar-nav__toggle",
  );
  const sidebarNav = document.querySelector(".header-sidebar-nav");
  const backgroundWrapper = document.querySelector(
    ".header-sidebar-nav__background-wrapper",
  );
  const closeButton = document.getElementById(
    "js-header-sidebar-nav__close-menu-button",
  );
  const menuWrapper = document.querySelector(
    ".header-sidebar-nav__menu-wrapper",
  );

  if (!sidebarNav) {
    return;
  }

  // showModal() makes the rest of the page inert, so screen readers and
  // keyboard users can't reach content behind the open menu.
  if (sidebarNavToggle) {
    sidebarNavToggle.addEventListener("click", () => {
      sidebarNav.showModal();
      sidebarNavToggle.setAttribute("aria-expanded", "true");
    });
  }

  // Fires both for close() and when the browser closes the dialog on Escape.
  sidebarNav.addEventListener("close", () => {
    if (sidebarNavToggle) {
      sidebarNavToggle.setAttribute("aria-expanded", "false");
      sidebarNavToggle.focus();
    }
  });

  if (closeButton) {
    closeButton.addEventListener("click", () => sidebarNav.close());
  }

  if (menuWrapper) {
    menuWrapper.addEventListener("click", (event) => {
      if (event.target.closest(".header__menu-navigation-item a")) {
        sidebarNav.close();
      }
    });
  }

  if (backgroundWrapper) {
    backgroundWrapper.addEventListener("click", (event) => {
      if (event.target === backgroundWrapper) {
        sidebarNav.close();
      }
    });
  }

  // header-state.js swaps to the desktop menu when there is room for it. That
  // hides the burger, so an open modal would leave the page inert with no way
  // to close it.
  new MutationObserver(() => {
    if (
      sidebarNav.open &&
      !document.documentElement.classList.contains("has-burger-menu")
    ) {
      sidebarNav.close();
    }
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
});
