from app.usecases.analyzer.pipeline import AnalyzerService

service = AnalyzerService()

url = "https://game4u.cx/"
# url = "https://google.com"
#
# url = "https://fb88.com"

result = service.analyze(url)

print("=" * 80)

print(result)
