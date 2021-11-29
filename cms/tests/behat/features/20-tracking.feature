Feature: Tracking
  Handle user tracking

  @api
  Scenario: Tracking is loaded
    Given I am logged in as a user with the "administer dpl_mapp configuration" permission
    When I go to "/admin/config/system/dpl-mapp"
    And I enter "1234" for "Id"
    And I press the "Gem indstillinger" button
    And I go to "/"
    Then the visit should be tracked for customer "1234"
