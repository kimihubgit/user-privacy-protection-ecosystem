export class ApiSync {
    constructor(apiUrl, syncIntervalMinutes) {
        this.apiUrl = apiUrl;
        this.syncIntervalMinutes = syncIntervalMinutes;
    }

    async fetchScamList() {
        try {
            console.log("Fetching scam list from server...");
            const result = await chrome.storage.local.get("apiUrl");
            const fetchUrl = result.apiUrl || this.apiUrl;
            const response = await fetch(fetchUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.domains) {
                await chrome.storage.local.set({ scamDomains: data.domains, lastUpdated: Date.now() });
                console.log("Scam list updated successfully:", data.domains);
            }
        } catch (error) {
            console.warn("Could not fetch scam list from API, using fallback data. Error:", error);
            const mockDomains = [
                "ludao.vn",
                "nhantienmienphi.com",
                "fake-bank-login.net",
                "scam-demo.com"
            ];
            const { scamDomains } = await chrome.storage.local.get("scamDomains");
            if (!scamDomains) {
                await chrome.storage.local.set({ scamDomains: mockDomains, lastUpdated: Date.now() });
                console.log("Initialized with mock scam list.");
            }
        }
    }

    initAlarm() {
        chrome.alarms.create("updateScamList", { periodInMinutes: this.syncIntervalMinutes });
    }
}
