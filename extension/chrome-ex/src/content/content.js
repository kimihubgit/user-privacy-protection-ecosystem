// Khởi chạy các lá chắn bảo vệ của KiGuard (Scam và Clickjacking)
if (typeof PopupBlockShield !== 'undefined') {
    PopupBlockShield.init();
}

if (typeof ClipboardShield !== 'undefined') {
    ClipboardShield.init();
}

if (typeof ScamShield !== 'undefined') {
    ScamShield.init();
}

if (typeof ClickjackingShield !== 'undefined') {
    ClickjackingShield.init();
}

if (typeof SearchResultShield !== 'undefined') {
    SearchResultShield.init();
}

// --- CANVAS FINGERPRINT BLOCKER ---
chrome.storage.local.get(['canvasFingerprintActive'], (result) => {
    if (result.canvasFingerprintActive) {
        // Create the port div
        const port = document.createElement('div');
        port.id = 'cc-blck-fp';
        port.dataset.enabled = 'true';
        port.dataset.mode = 'random';
        (document.head || document.documentElement).appendChild(port);

        // Inject script into page context (MAIN world)
        const injectCode = `(function() {
            const port = document.getElementById('cc-blck-fp');
            if (!port) return;
            let gshift;
            const map = new WeakMap();
            const revert = canvas =>  {
                const  {
                    width, height
                }
                = canvas;
                const context = canvas.getContext('2d',  {
                    willReadFrequently: true
                }
                );
                const matt = getImageData.apply(context, [0, 0, width, height]);
                const o = map.get(canvas);
                map.delete(canvas);
                // only revert if canvas still the same size
                // https://github.com/joue-quroi/canvas-fingerprint-blocker/pull/19
                if (o.width === width && o.height === height)  {
                    matt.data.set(o.data);
                    context.putImageData(matt, 0, 0);
                }
            };
            const getImageData = CanvasRenderingContext2D.prototype.getImageData;
            const manipulate = canvas =>  {
                port.dispatchEvent(new Event('manipulate'));
                // already manipulated
                if (map.has(canvas))  {
                    return;
                }
                const  {
                    width, height
                }
                = canvas;
                const context = canvas.getContext('2d',  {
                    willReadFrequently: true
                }
                );
                const matt = getImageData.apply(context, [0, 0, width, height]);
                map.set(canvas,  {
                    width,
                    height,
                    data: matt.data
                }
                );
                const shift = (port.dataset.mode === 'session' && gshift) ? gshift :  {
                    'r': port.dataset.mode === 'random' ? Math.floor(Math.random() * 10) - 5 : Number(port.dataset.red || 0),
                    'g': port.dataset.mode === 'random' ? Math.floor(Math.random() * 10) - 5 : Number(port.dataset.green || 0),
                    'b': port.dataset.mode === 'random' ? Math.floor(Math.random() * 10) - 5 : Number(port.dataset.blue || 0)
                };
                gshift = gshift || shift;
                for (let i = 0; i < height; i += Math.max(1, parseInt(height / 10)))  {
                    for (let j = 0; j < width; j += Math.max(1, parseInt(width / 10)))  {
                        const n = ((i * (width * 4)) + (j * 4));
                        matt.data[n + 0] = matt.data[n + 0] + shift.r;
                        matt.data[n + 1] = matt.data[n + 1] + shift.g;
                        matt.data[n + 2] = matt.data[n + 2] + shift.b;
                    }
                }
                context.putImageData(matt, 0, 0);
                // convert back to original
                setTimeout(revert, 0, canvas);
            };
            
            HTMLCanvasElement.prototype.toBlob = new Proxy(HTMLCanvasElement.prototype.toBlob,  {
                apply(target, self, args)  {
                    if (port.dataset.enabled === 'true')  {
                        try  {
                            manipulate(self);
                        }
                        catch (e)  {
                        }
                    }
                    return Reflect.apply(target, self, args);
                }
            });
            HTMLCanvasElement.prototype.toDataURL = new Proxy(HTMLCanvasElement.prototype.toDataURL,  {
                apply(target, self, args)  {
                    if (port.dataset.enabled === 'true')  {
                        try  {
                            manipulate(self);
                        }
                        catch (e)  {
                        }
                    }
                    return Reflect.apply(target, self, args);
                }
            });
            CanvasRenderingContext2D.prototype.getImageData = new Proxy(CanvasRenderingContext2D.prototype.getImageData,  {
                apply(target, self, args)  {
                    if (port.dataset.enabled === 'true')  {
                        try  {
                            manipulate(self.canvas);
                        }
                        catch (e)  {
                        }
                    }
                    return Reflect.apply(target, self, args);
                }
            });
            // since we are going to read it many times
            HTMLCanvasElement.prototype.getContext = new Proxy(HTMLCanvasElement.prototype.getContext,  {
                apply(target, self, args)  {
                    if (port.dataset.enabled === 'true' && args[0] === '2d')  {
                        args[1] = args[1] ||  {};
                        args[1].willReadFrequently = true;
                    }
                    return Reflect.apply(target, self, args);
                }
            });
            // force inject to sandbox
            {
                const observe = e =>  {
                    if (e.source && e.data === 'inject-script-into-source')  {
                        try  {
                            e.source.HTMLCanvasElement.prototype.toBlob = HTMLCanvasElement.prototype.toBlob;
                            e.source.HTMLCanvasElement.prototype.toDataURL = HTMLCanvasElement.prototype.toDataURL;
                            e.source.CanvasRenderingContext2D.prototype.getImageData = CanvasRenderingContext2D.prototype.getImageData;
                            e.source.addEventListener('message', observe);
                            port.dataset.dirty = false;
                        }
                        catch (e)  {
                            console.warn('Cannot spoof Canvas', e.source, e);
                        }
                    }
                };
                addEventListener('message', observe);
            }
        })();`;

        const script = document.createElement('script');
        script.textContent = injectCode;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    }
});

// --- FACEBOOK INTEGRATIONS BRIDGE ---
const isFacebook = window.location.hostname.endsWith('facebook.com') || window.location.hostname.endsWith('messenger.com');
if (isFacebook) {

    // 2. Bridge for FbWsHook
    const syncFbSettings = () => {
        chrome.storage.local.get(['block_seen_chat', 'block_typing_chat'], (result) => {
            document.dispatchEvent(new CustomEvent('__KIGUARD_FB_SETTINGS__', {
                detail: {
                    block_seen_chat: result.block_seen_chat === true,
                    block_typing_chat: result.block_typing_chat === true
                }
            }));
        });
    };
    syncFbSettings();

    // 3. Listen for changes to update MAIN world contexts dynamically
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.block_seen_chat || changes.block_typing_chat) {
            syncFbSettings();
        }
    });
}

// --- PROXY SPOOFING INJECTION ---
chrome.storage.local.get(['proxyAdvancedSettings', 'proxyConfig'], (result) => {
    const settings = result.proxyAdvancedSettings;
    const proxyConfig = result.proxyConfig;
    if (settings && proxyConfig && proxyConfig.enabled) {
        let injectCode = '';
        
        if (settings.webrtcEnabled && settings.webrtcPolicy === 'block_entirely') {
            injectCode += `
                try {
                    window.RTCPeerConnection = undefined;
                    window.webkitRTCPeerConnection = undefined;
                    window.RTCSessionDescription = undefined;
                    window.RTCIceCandidate = undefined;
                } catch (e) { console.error("[KiGuard WebRTC Block] Error:", e); }
            `;
        }

        if (settings.timezoneEnabled && proxyConfig.timezone) {
            injectCode += `
                try {
                    const targetTimezone = "${proxyConfig.timezone}";
                    const originalResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
                    Intl.DateTimeFormat.prototype.resolvedOptions = function() {
                        const opts = originalResolvedOptions.call(this);
                        opts.timeZone = targetTimezone;
                        return opts;
                    };
                } catch (e) { console.error("[KiGuard Timezone Spoof] Error:", e); }
            `;
        }
        
        let hasGps = false;
        let lat = null;
        let lng = null;

        if (settings.gpsEnabled) {
            if (settings.gpsMode === 'manual') {
                const parsedLat = parseFloat(settings.gpsLat);
                const parsedLng = parseFloat(settings.gpsLng);
                if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                    lat = parsedLat;
                    lng = parsedLng;
                    hasGps = true;
                }
            } else {
                const parsedLat = parseFloat(proxyConfig.latitude);
                const parsedLng = parseFloat(proxyConfig.longitude);
                if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
                    lat = parsedLat;
                    lng = parsedLng;
                    hasGps = true;
                }
            }
        }

        if (hasGps && lat !== null && lng !== null) {
            injectCode += `
                try {
                    const targetLat = ${lat};
                    const targetLng = ${lng};
                    const mockCoords = {
                        latitude: targetLat,
                        longitude: targetLng,
                        accuracy: 10,
                        altitude: null,
                        altitudeAccuracy: null,
                        heading: null,
                        speed: null
                    };
                    const mockPos = {
                        coords: mockCoords,
                        timestamp: Date.now()
                    };

                    if (navigator && navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition = function(success, error, options) {
                            if (typeof success === 'function') {
                                setTimeout(function() { success(mockPos); }, 5);
                            }
                        };
                        navigator.geolocation.watchPosition = function(success, error, options) {
                            if (typeof success === 'function') {
                                setTimeout(function() { success(mockPos); }, 5);
                            }
                            return 12345;
                        };
                    }
                } catch (e) { console.error("[KiGuard Geolocation Spoof] Error:", e); }
            `;
        }

        if (settings.uaEnabled && settings.userAgent) {
            injectCode += `
                try {
                    const targetUA = ${JSON.stringify(settings.userAgent)};
                    Object.defineProperty(navigator, 'userAgent', {
                        get: function() { return targetUA; },
                        configurable: true
                    });
                    Object.defineProperty(navigator, 'appVersion', {
                        get: function() { return targetUA; },
                        configurable: true
                    });
                    if (navigator.userAgentData) {
                        Object.defineProperty(navigator, 'userAgentData', {
                            get: function() { return undefined; },
                            configurable: true
                        });
                    }
                } catch (e) { console.error("[KiGuard UA Spoof] Error:", e); }
            `;
        }
        
        if (injectCode) {
            const doInject = () => {
                try {
                    const script = document.createElement('script');
                    script.textContent = `(function() { ${injectCode} })();`;
                    const parent = document.head || document.documentElement || document.body;
                    if (parent) {
                        parent.appendChild(script);
                        script.remove();
                    }
                } catch (e) {}
            };

            if (document.head || document.documentElement || document.body) {
                doInject();
            } else {
                document.addEventListener('DOMContentLoaded', doInject, { once: true });
            }
        }
});

