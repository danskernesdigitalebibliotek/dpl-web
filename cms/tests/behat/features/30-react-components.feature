Feature: React components
  Show that React components with integration to library systems work

  @api
  Scenario: Tokens are available
    Given I enable modules "dpl_react"
    And a library token can be fetched
    And I run cron from the web UI
    And I am authenticated on Adgangsplatformen
    And I log in with Adgangsplatformen
    Then I should have a "library" token
    And I should have a "user" token
