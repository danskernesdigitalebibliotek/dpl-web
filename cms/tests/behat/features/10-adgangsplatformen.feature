Feature: Adgangsplatformen
  Handle authentication with Adgangsplatformen, the single signon platform used by the Danish Public Libraries

  Scenario: Login
    Given I am an anonymous user
    And I am authenticated on Adgangsplatformen
    And I log in with Adgangsplatformen
    Then I am authenticated as a patron
