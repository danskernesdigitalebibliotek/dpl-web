module.exports = {
  "ci": {
    "assert": {
      "assertions": {
        // Our quality standard requires all categories to be green. Green
        // translates to a score between 90 and 100 - or 0.9-1.
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
};
