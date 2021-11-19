Feature: Smoke test
  Simple test to check if test site is running.

  Scenario: See front page
    Given I am on "/"
    Then I should see "bibliotek"

  Scenario: Load mocked service
    Given the following services exist with mappings:
      | service | mapping    |
      | smoke   | smoke.json |
    When I am on "http://dummy/smoke/test"
    Then the response status code should be 200
    And the response should contain "{\"success\":true}"
