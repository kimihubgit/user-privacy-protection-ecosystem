"""
app.data.countries
===================

Country reference data (ISO codes + optional risk banding for hosting /
registrant geolocation context). No logic.

Schema:

    {
        "iso2": str,
        "iso3": str,
        "name": str,
        "risk_profile": str,  # "high" | "medium" | "low" -- infra-abuse
                               # reporting context only, not a statement
                               # about the country or its people.
    }
"""

COUNTRIES = [
    {"iso2": "VN", "iso3": "VNM", "name": "Vietnam", "risk_profile": "low"},
    {"iso2": "US", "iso3": "USA", "name": "United States", "risk_profile": "low"},
    {"iso2": "GB", "iso3": "GBR", "name": "United Kingdom", "risk_profile": "low"},
    {"iso2": "SG", "iso3": "SGP", "name": "Singapore", "risk_profile": "low"},
    {"iso2": "JP", "iso3": "JPN", "name": "Japan", "risk_profile": "low"},
    {"iso2": "KR", "iso3": "KOR", "name": "South Korea", "risk_profile": "low"},
    {"iso2": "AU", "iso3": "AUS", "name": "Australia", "risk_profile": "low"},
    {"iso2": "DE", "iso3": "DEU", "name": "Germany", "risk_profile": "low"},
    {"iso2": "FR", "iso3": "FRA", "name": "France", "risk_profile": "low"},
    {"iso2": "CA", "iso3": "CAN", "name": "Canada", "risk_profile": "low"},
    {"iso2": "CN", "iso3": "CHN", "name": "China", "risk_profile": "medium"},
    {"iso2": "RU", "iso3": "RUS", "name": "Russia", "risk_profile": "medium"},
    {"iso2": "IN", "iso3": "IND", "name": "India", "risk_profile": "medium"},
    {"iso2": "BR", "iso3": "BRA", "name": "Brazil", "risk_profile": "medium"},
    {"iso2": "NG", "iso3": "NGA", "name": "Nigeria", "risk_profile": "medium"},
    {"iso2": "ID", "iso3": "IDN", "name": "Indonesia", "risk_profile": "medium"},
    {"iso2": "PH", "iso3": "PHL", "name": "Philippines", "risk_profile": "medium"},
    {"iso2": "PA", "iso3": "PAN", "name": "Panama", "risk_profile": "medium"},
    {"iso2": "SC", "iso3": "SYC", "name": "Seychelles", "risk_profile": "high"},
    {"iso2": "BZ", "iso3": "BLZ", "name": "Belize", "risk_profile": "high"},
    {"iso2": "KY", "iso3": "CYM", "name": "Cayman Islands", "risk_profile": "high"},
    {"iso2": "MD", "iso3": "MDA", "name": "Moldova", "risk_profile": "high"},
    {"iso2": "KP", "iso3": "PRK", "name": "North Korea", "risk_profile": "high"},
]
