importScripts('../lib/prism.js');

// Beautifiers
function beautifyJSON(text) {
    try {
        const parsed = JSON.parse(text);
        return JSON.stringify(parsed, null, 4);
    } catch (e) {
        return text;
    }
}

function beautifyJS(code) {
    let indent = 0;
    let formatted = '';
    let expanded = code
        .replace(/;(?!\s*\/)/g, ';\n')
        .replace(/\{/g, ' {\n')
        .replace(/\}/g, '\n}\n');
        
    const lines = expanded.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;
        
        if (line.startsWith('}') || line.startsWith(']')) {
            indent = Math.max(0, indent - 1);
        }
        
        formatted += '    '.repeat(indent) + line + '\n';
        
        if (line.endsWith('{') || line.endsWith('[')) {
            indent++;
        }
    }
    return formatted.trim();
}

function beautifyHTML(html) {
    const tokens = [];
    let i = 0;
    const len = html.length;

    while (i < len) {
        // Match comments
        if (html.startsWith('<!--', i)) {
            const end = html.indexOf('-->', i + 4);
            if (end === -1) {
                tokens.push({ type: 'comment', content: html.slice(i) });
                break;
            } else {
                tokens.push({ type: 'comment', content: html.slice(i, end + 3) });
                i = end + 3;
                continue;
            }
        }

        // Match tags
        if (html[i] === '<') {
            const isClosing = html[i + 1] === '/';
            let inQuote = null;
            let tagEnd = -1;
            for (let j = i + 1; j < len; j++) {
                const char = html[j];
                if (char === '"' || char === "'") {
                    if (!inQuote) inQuote = char;
                    else if (inQuote === char) inQuote = null;
                }
                if (!inQuote && char === '>') {
                    tagEnd = j;
                    break;
                }
            }

            if (tagEnd !== -1) {
                const tagContent = html.slice(i, tagEnd + 1);
                const tagNameMatch = tagContent.match(/^<\/?([a-zA-Z0-9\:\-\_]+)/);
                const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';

                let type = 'open';
                if (isClosing) {
                    type = 'close';
                } else if (
                    tagContent.endsWith('/>') ||
                    /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr|command|keygen)$/i.test(tagName)
                ) {
                    type = 'self-closing';
                }

                tokens.push({ type, name: tagName, content: tagContent });
                i = tagEnd + 1;

                // Handle script/style tag content as raw
                if (type === 'open' && (tagName === 'script' || tagName === 'style')) {
                    const closeTag = `</${tagName}>`;
                    const closeIndex = html.toLowerCase().indexOf(closeTag, i);
                    if (closeIndex !== -1) {
                        const innerContent = html.slice(i, closeIndex);
                        tokens.push({ type: 'raw', name: tagName, content: innerContent });
                        tokens.push({ type: 'close', name: tagName, content: closeTag });
                        i = closeIndex + closeTag.length;
                    }
                }
                continue;
            }
        }

        // Match text content
        let textEnd = html.indexOf('<', i);
        if (textEnd === -1) textEnd = len;
        const textContent = html.slice(i, textEnd);
        if (textContent.trim()) {
            tokens.push({ type: 'text', content: textContent.trim() });
        }
        i = textEnd;
    }

    // Format tokens
    let formatted = '';
    let indent = 0;
    const indentStr = '    ';

    for (let k = 0; k < tokens.length; k++) {
        const token = tokens[k];

        if (token.type === 'close') {
            indent = Math.max(0, indent - 1);
        }

        if (token.type === 'raw' || token.type === 'text') {
            const lines = token.content.split('\n');
            let baseIndent = indentStr.repeat(indent);
            let formattedBlock = '';
            
            for (let l = 0; l < lines.length; l++) {
                const trimmedLine = lines[l].trim();
                if (trimmedLine) {
                    formattedBlock += baseIndent + trimmedLine + '\n';
                }
            }
            formatted += formattedBlock;
        } else {
            formatted += indentStr.repeat(indent) + token.content + '\n';
        }

        if (token.type === 'open') {
            indent++;
        }
    }

    return formatted.trim();
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

self.onmessage = function(e) {
    const { text: rawText, lang, beautify } = e.data;
    let text = rawText;

    // 1. Beautify if requested
    if (beautify) {
        if (lang === 'json') {
            text = beautifyJSON(text);
        } else if (['javascript', 'typescript', 'jsx', 'css'].includes(lang)) {
            text = beautifyJS(text);
        } else if (lang === 'html') {
            text = beautifyHTML(text);
        }
    }

    // 2. Syntax Highlight with Prism
    let highlightedHtml = '';
    if (lang && lang !== 'none' && self.Prism && self.Prism.languages[lang]) {
        try {
            highlightedHtml = self.Prism.highlight(text, self.Prism.languages[lang], lang);
        } catch (err) {
            highlightedHtml = escapeHtml(text);
        }
    } else {
        highlightedHtml = escapeHtml(text);
    }

    const lineCount = text.split('\n').length;

    // Send back results
    self.postMessage({
        text,
        highlightedHtml,
        lineCount
    });
};
