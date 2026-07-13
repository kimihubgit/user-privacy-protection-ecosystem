(() => {
    // Text Encoder & Decoder for MQTT binary payload serialization
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const CMD_NAMES = [
        null, 'connect', 'connack', 'publish', 'puback',
        'pubrec', 'pubrel', 'pubcomp', 'subscribe', 'suback',
        'unsubscribe', 'unsuback', 'pingreq', 'pingresp', 'disconnect', 'auth'
    ];

    function decodeRemainingLength(data, startIndex) {
        let value = 0, multiplier = 1, index = startIndex, byte;
        do {
            if (index >= data.length) throw new Error('Incomplete remaining length');
            byte = data[index++];
            value += (byte & 0x7F) * multiplier;
            multiplier *= 128;
        } while (byte & 0x80);
        return { value, bytesRead: index - startIndex };
    }

    function encodeRemainingLength(length) {
        const bytes = [];
        do {
            let byte = length % 128;
            length = Math.floor(length / 128);
            if (length > 0) byte |= 0x80;
            bytes.push(byte);
        } while (length > 0);
        return bytes;
    }

    function parseMqttPacket(data) {
        let pos = 0;
        const packets = [];
        while (pos < data.length) {
            const byte0 = data[pos];
            const typeNum = (byte0 >> 4) & 0x0F;
            const cmd = CMD_NAMES[typeNum];

            const rl = decodeRemainingLength(data, pos + 1);
            const headerSize = 1 + rl.bytesRead;
            const remainingLength = rl.value;

            if (pos + headerSize + remainingLength > data.length) {
                break;
            }

            const packet = { cmd };
            let offset = pos + headerSize;

            if (typeNum === 3) { // PUBLISH
                packet.qos = (byte0 >> 1) & 0x03;
                packet.dup = !!(byte0 & 0x08);
                packet.retain = !!(byte0 & 0x01);

                const topicLen = (data[offset] << 8) | data[offset + 1];
                offset += 2;
                packet.topic = decoder.decode(data.subarray(offset, offset + topicLen));
                offset += topicLen;

                if (packet.qos > 0) {
                    packet.messageId = (data[offset] << 8) | data[offset + 1];
                    offset += 2;
                }

                packet.payload = data.slice(offset, pos + headerSize + remainingLength);
            }

            packets.push(packet);
            pos += headerSize + remainingLength;
        }
        return packets;
    }

    function generateMqttPublish(packet) {
        const qos = packet.qos || 0;
        const topicBytes = encoder.encode(packet.topic);

        let payloadBytes;
        if (packet.payload instanceof Uint8Array) {
            payloadBytes = packet.payload;
        } else if (typeof packet.payload === 'string') {
            payloadBytes = encoder.encode(packet.payload);
        } else {
            payloadBytes = new Uint8Array(0);
        }

        const hasMessageId = qos > 0;
        const remainingLength = 2 + topicBytes.length + (hasMessageId ? 2 : 0) + payloadBytes.length;
        const rlBytes = encodeRemainingLength(remainingLength);

        const byte0 = (3 << 4) |
            ((packet.dup ? 1 : 0) << 3) |
            ((qos & 0x03) << 1) |
            (packet.retain ? 1 : 0);

        const totalSize = 1 + rlBytes.length + remainingLength;
        const buffer = new Uint8Array(totalSize);
        let pos = 0;

        buffer[pos++] = byte0;
        for (let j = 0; j < rlBytes.length; j++) buffer[pos++] = rlBytes[j];

        // Topic length (big-endian) + topic string
        buffer[pos++] = (topicBytes.length >> 8) & 0xFF;
        buffer[pos++] = topicBytes.length & 0xFF;
        buffer.set(topicBytes, pos);
        pos += topicBytes.length;

        // Message ID (if QoS > 0)
        if (hasMessageId) {
            buffer[pos++] = (packet.messageId >> 8) & 0xFF;
            buffer[pos++] = packet.messageId & 0xFF;
        }

        // Payload
        buffer.set(payloadBytes, pos);
        return buffer.buffer;
    }

    // Default settings
    const settings = {
        block_seen_chat: false,
        block_typing_chat: false
    };

    // Load initial settings and listen to changes from extension bridge
    document.addEventListener('__KIGUARD_FB_SETTINGS__', (e) => {
        if (e.detail) {
            if (typeof e.detail.block_seen_chat !== 'undefined') {
                settings.block_seen_chat = e.detail.block_seen_chat;
            }
            if (typeof e.detail.block_typing_chat !== 'undefined') {
                settings.block_typing_chat = e.detail.block_typing_chat;
            }
        }
    });

    function getUserID() {
        try {
            return document.cookie.match(/c_user=([0-9]+)/)[1];
        } catch (e) {
            return null;
        }
    }

    function safeParse(str) {
        if (!str) return null;
        try {
            return JSON.parse(str);
        } catch (e) {
            return null;
        }
    }

    const c_user = getUserID();

    // Hook window.WebSocket to intercept chat signals
    const wsProxy = new Proxy(window.WebSocket, {
        construct(target, args) {
            const instance = new target(...args);

            instance.send = new Proxy(instance.send, {
                apply(sendTarget, thisArg, sendArgs) {
                    const originalData = sendArgs[0];
                    if (!(originalData instanceof ArrayBuffer || originalData instanceof Uint8Array)) {
                        return sendTarget.apply(thisArg, sendArgs);
                    }

                    const rawData = new Uint8Array(originalData);
                    try {
                        const packets = parseMqttPacket(rawData);
                        if (packets.length === 0) {
                            return sendTarget.apply(thisArg, sendArgs);
                        }

                        const packet = packets[0];
                        if (packet.cmd === 'publish' && packet.topic === '/ls_req' && packet.payload) {
                            const payloadString = decoder.decode(packet.payload);
                            const parsedRequest = safeParse(payloadString);

                            if (parsedRequest && parsedRequest.type === 4 && settings.block_typing_chat) {
                                // Block typing indicator
                                const innerPayload = safeParse(parsedRequest.payload);
                                if (innerPayload) {
                                    const details = safeParse(innerPayload.payload);
                                    if (details && details.thread_key) {
                                        // Intercept: don't send anything
                                        return;
                                    }
                                }
                            }

                            if (parsedRequest && parsedRequest.type === 3 && settings.block_seen_chat) {
                                // Block seen receipt
                                const innerPayload = safeParse(parsedRequest.payload);
                                if (innerPayload && innerPayload.tasks) {
                                    let hasSeenTask = false;
                                    for (let i = 0; i < innerPayload.tasks.length; i++) {
                                        if (innerPayload.tasks[i].label === '21') {
                                            hasSeenTask = true;
                                            innerPayload.tasks[i].payload = JSON.stringify({
                                                thread_id: c_user ? c_user.toString() : '',
                                                last_read_watermark_ts: Date.now() * 1000
                                            });
                                        }
                                    }

                                    if (hasSeenTask) {
                                        parsedRequest.payload = JSON.stringify(innerPayload);
                                        packet.payload = encoder.encode(JSON.stringify(parsedRequest));
                                        sendArgs[0] = generateMqttPublish(packet);
                                        return sendTarget.apply(thisArg, sendArgs);
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        // Ignore parsing errors and fallback to original send
                    }

                    return sendTarget.apply(thisArg, sendArgs);
                }
            });

            return instance;
        }
    });

    window.WebSocket = wsProxy;
})();
