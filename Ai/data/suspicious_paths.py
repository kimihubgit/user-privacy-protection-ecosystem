"""
app.data.suspicious_paths
==========================

URL path fragments commonly seen in phishing kit deployments and
credential-harvesting pages. No logic.
"""

SUSPICIOUS_PATHS = [
    "/wp-content/uploads/",
    "/wp-includes/",
    "/.well-known/",
    "/secure/login/",
    "/signin/verify/",
    "/account/update/",
    "/account/confirm/",
    "/customer/center/",
    "/webscr/",
    "/cgi-bin/",
    "/verify/identity/",
    "/authenticate/session/",
    "/reset/password/",
    "/support/ticket/verify/",
    "/documents/invoice/",
    "/files/statement/",
    "/portal/redirect/",
    "/login.php",
    "/index.php?login",
    "/secure-login/",
    "/myaccount/signin/",
    "/banking/online/",
    "/otp/confirm/",
    "/update-info/",
    "/verify-now/",
]
