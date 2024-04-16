/**
 * @file
 * Checks if a paragraph of type 'user_registration_linklist'
 * exists in the DOM. If it does, it replaces it with a
 * the 'user_registration_section__button_row' paragraph.
 */
(function dplParagraphsBehaviorWrapper(Drupal) {
  Drupal.behaviors.dplParagraphsBehavior = {
    attach(context) {
      const buttonRow = context.querySelector(
        ".paragraphs__item--user_registration_section__button_row"
      );
      const linkList = context.querySelector(
        ".paragraphs__item--user_registration_linklist"
      );
      if (buttonRow && linkList) {
        if (buttonRow.children.length > 0) {
          linkList.appendChild(buttonRow);
          buttonRow.style.display = "block";
        } else {
          buttonRow.style.display = "block";
        }
      } else if (buttonRow) {
        buttonRow.style.display = "block";
      }
    },
  };
})(Drupal);
