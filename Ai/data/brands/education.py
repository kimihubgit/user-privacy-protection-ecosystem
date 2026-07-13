"""
Education / e-learning brands commonly impersonated in phishing
(student portals, scholarship scams, credential harvesting via LMS lures).
Schema documented in app.data.brands.__init__.
"""

EDUCATION_BRANDS = [
    {
        "display_name": "Coursera",
        "domains": ["coursera.org"],
        "aliases": ["coursera"],
        "category": "education",
        "risk_profile": "low",
    },
    {
        "display_name": "edX",
        "domains": ["edx.org"],
        "aliases": ["edx"],
        "category": "education",
        "risk_profile": "low",
    },
    {
        "display_name": "Google Classroom",
        "domains": ["classroom.google.com"],
        "aliases": ["google classroom"],
        "category": "education",
        "risk_profile": "medium",
    },
    {
        "display_name": "Microsoft Teams for Education",
        "domains": ["teams.microsoft.com"],
        "aliases": ["ms teams", "teams for education"],
        "category": "education",
        "risk_profile": "medium",
    },
    {
        "display_name": "Bo Giao duc va Dao tao (MOET)",
        "domains": ["moet.gov.vn"],
        "aliases": ["bo gd&dt", "moet"],
        "category": "education",
        "risk_profile": "medium",
    },
    {
        "display_name": "Blackboard",
        "domains": ["blackboard.com"],
        "aliases": ["blackboard"],
        "category": "education",
        "risk_profile": "low",
    },
    {
        "display_name": "Canvas LMS",
        "domains": ["instructure.com"],
        "aliases": ["canvas", "canvas lms"],
        "category": "education",
        "risk_profile": "low",
    },
]
