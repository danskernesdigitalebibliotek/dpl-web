// Radix (dialog) and vaul (drawer) treat a pointerdown on portalled toasts as
// an "outside" interaction and dismiss the modal. Prevent dismissal when the
// interaction starts inside the sonner toaster so toasts can be swiped away
// while a modal is open.
export const preventDismissOnToastInteraction = (event: {
  target: EventTarget | null
  preventDefault: () => void
}) => {
  if (event.target instanceof Element && event.target.closest("[data-sonner-toaster]")) {
    event.preventDefault()
  }
}
