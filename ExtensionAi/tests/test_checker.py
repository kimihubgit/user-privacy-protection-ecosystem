from app.usecases.analyzer.analyzer_service import AnalyzerService

service = AnalyzerService()

url = "https://nlg.de.com/"
# url = "https://google.com"
# url = "https://fb88.com"

result = service.analyze(url)

print("=" * 80)
print(result)