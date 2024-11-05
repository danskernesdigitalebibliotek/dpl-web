export const useDarkMode = () => {
  document.body.classList.remove("light-mode")
  document.body.classList.add("dark-mode")
}

export const useLightMode = () => {
  document.body.classList.remove("dark-mode")
  document.body.classList.add("light-mode")
}
