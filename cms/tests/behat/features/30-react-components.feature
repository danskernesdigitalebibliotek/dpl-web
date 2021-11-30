Feature: React components
  Show that React components with integration to library systems work

  @api
  Scenario: Tokens are available
    Given I enable modules "ddb_react, ddb_react_demo"
    And a library token can be fetched
    And I run cron
    And I am authenticated on Adgangsplatformen
    And I log in with Adgangsplatformen
    Then I should have a "library" token
    And I should have a "user" token

  @api
  Scenario: Add to checklist works
    Given I enable modules "ddb_react, ddb_react_demo"
    And a library token can be fetched
    And I run cron
    And I am authenticated on Adgangsplatformen
    And my checklist is empty
    And I log in with Adgangsplatformen
    And I go to "/react-ddb-demo"
    And I wait for async requests to complete
    And I press the "Add to checklist" button
    And I wait for async requests to complete
    Then the material should be added to my checklist
    And I should see "Added to checklist"
