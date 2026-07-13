import requests

# Thay YOUR_SECRET_KEY bằng secret key của bạn
sk = "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"

url = "https://api.stripe.com/v1/tokens"

data = {
    "card[number]": "5154620061414478",
    "card[exp_month]": "01",
    "card[exp_year]": "2023",
    "card[cvc]": "235"
}

response = requests.post(
    url,
    data=data,
    auth=(sk, ""),           # Basic Auth: secret_key : (rỗng)
    headers={
        "Content-Type": "application/x-www-form-urlencoded"
    }
)

# In kết quả ra màn hình
print(response.status_code)
print(response.text)

# Lưu vào file giống như PHP
with open("as.txt", "w", encoding="utf-8") as f:
    f.write(response.text)