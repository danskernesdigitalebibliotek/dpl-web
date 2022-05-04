Feature: React components
  Show that React components with integration to library systems work

  @api
  Scenario: Tokens are available
    Given I enable modules "dpl_react, dpl_react_demo"
    And a library token can be fetched
    And I run cron from the web UI
    And I am authenticated on Adgangsplatformen
    And I log in with Adgangsplatformen
    Then I should have a "library" token
    And I should have a "user" token

  @api
  Scenario: Hello World is shown
    Given I enable modules "dpl_react, dpl_react_demo"
    And I go to "/react-dpl-demo"
    And I should see "Hello World"
