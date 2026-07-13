"""
app.data
========

Pure static reference data for the phishing / threat detection engine.

Rules for every module in this package (enforced by convention + review,
see CONTRIBUTING notes in each subpackage):

    - Only literal data structures are allowed: list, tuple, dict, set,
      enum.Enum / enum.IntEnum, and simple module-level constants.
    - No functions (`def`), no classes (`class`) other than Enum
      definitions, no third-party imports (requests, bs4, etc.),
      no control flow (`if`, `for`, `while`), no regex compilation.
    - All scoring, matching, normalization and fetching logic lives in
      the detector / service layer, not here.

This keeps the dataset trivially diffable, reviewable, testable and
swappable (e.g. loaded from a DB or remote feed later) without ever
touching detection logic.
"""

# Sub-packages (brands, keywords) are imported directly where needed.
