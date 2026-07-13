import { crxToZip, triggerDownload } from '../shared/crx.js';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(location.search);
    let crxUrl = urlParams.get('crx');
    let extensionId = urlParams.get('id');

    // Extract extension ID from URL if not explicitly provided
    if (!extensionId && crxUrl) {
        const idMatch = crxUrl.match(/[?&]x=id%3D([a-p]{32})/) || crxUrl.match(/[?&]id=([a-p]{32})/) || crxUrl.match(/\/([a-p]{32})(?:\/|\?|$)/);
        if (idMatch) {
            extensionId = idMatch[1];
        }
    }

    if (!crxUrl && extensionId) {
        crxUrl = `https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x86-64&os_arch=x86-64&nacl_arch=x86-64&prod=chromecrx&prodchannel=unknown&prodversion=149.0.0.0&acceptformat=crx2,crx3&x=id%3D${extensionId}%26uc`;
    }

    if (!extensionId) {
        showError("Không tìm thấy ID Extension hợp lệ trong URL.");
        return;
    }

    document.getElementById('ext-id').textContent = `ID: ${extensionId}`;
    document.getElementById('ext-name').textContent = `Extension: ${extensionId}`;

    let originalCrxBuffer = null;
    let cleanZipBuffer = null;
    let zipInstance = null;
    let currentActiveFileObj = null;
    let currentActiveFileText = '';
    let prismWorker = new Worker('prism-worker.js');
    let isOnDemandHighlight = false;
    let currentLanguage = 'none';

    let visibleLines = [];
    let totalLinesCount = 0;
    const LINE_HEIGHT = 20;
    const BUFFER_LINES = 10;

    // Bind file action listeners
    const toggleBeautify = document.getElementById('toggle-beautify');
    if (toggleBeautify) {
        toggleBeautify.addEventListener('change', () => {
            if (currentActiveFileObj) {
                loadFileContent(currentActiveFileObj);
            }
        });
    }

    const btnCopyFile = document.getElementById('btn-copy-file');
    if (btnCopyFile) {
        btnCopyFile.addEventListener('click', copyCurrentFile);
    }

    const btnDownloadFile = document.getElementById('btn-download-file');
    if (btnDownloadFile) {
        btnDownloadFile.addEventListener('click', downloadCurrentFile);
    }

    // Bind scroll listener for virtual scrolling
    const scrollContainer = document.getElementById('code-scroll-container');
    if (scrollContainer) {
        scrollContainer.addEventListener('scroll', updateVirtualScroll);
        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => {
                if (totalLinesCount > 0) {
                    updateVirtualScroll();
                }
            });
            ro.observe(scrollContainer);
        }
    }

    // Fetch and Parse CRX
    initViewer(crxUrl, extensionId);

    async function initViewer(url, id) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Tải xuống thất bại. HTTP Status: ${response.status}`);
            }

            originalCrxBuffer = await response.arrayBuffer();
            cleanZipBuffer = crxToZip(originalCrxBuffer);
            zipInstance = await JSZip.loadAsync(cleanZipBuffer);

            // Set extension name if manifest exists
            await tryParseManifest(zipInstance, id);

            // Render File Tree
            renderTree(zipInstance);

            // Bind downloads
            setupDownloadActions(id);

        } catch (error) {
            console.error("Lỗi khởi tạo viewer:", error);
            showError(error.message || "Đã xảy ra lỗi khi tải và giải nén extension.");
        }
    }



    async function tryParseManifest(zip, id) {
        const manifestFile = zip.file("manifest.json");
        if (manifestFile) {
            try {
                const content = await manifestFile.async("string");
                const manifest = JSON.parse(content);
                let name = manifest.name || id;
                // Clean locales placeholders (e.g. __MSG_extName__) if any
                if (name.startsWith('__MSG_') && name.endsWith('__')) {
                    name = id;
                }
                document.getElementById('ext-name').textContent = name;
                document.title = `${name} - KiGuard Source Viewer`;
            } catch (e) {
                console.warn("Lỗi đọc manifest.json:", e);
            }
        }
    }

    // Parse and render file structure
    function renderTree(zip) {
        const container = document.getElementById('file-tree-container');
        container.innerHTML = '';

        const fileStructure = {};

        zip.forEach((relativePath, fileObj) => {
            const parts = relativePath.split('/');
            let current = fileStructure;

            parts.forEach((part, index) => {
                if (!part) return; // Skip trailing folder slash
                const isLast = index === parts.length - 1;
                const isFolder = fileObj.dir || !isLast;

                if (!current[part]) {
                    current[part] = {
                        name: part,
                        path: relativePath,
                        isFolder: isFolder,
                        fileObj: isFolder ? null : fileObj,
                        children: isFolder ? {} : null
                    };
                }
                current = current[part].children || {};
            });
        });

        const sortedRoot = sortTreeNodes(fileStructure);
        const treeRootElement = document.createElement('div');
        treeRootElement.className = 'tree-root';

        buildHtmlNodes(sortedRoot, treeRootElement);
        container.appendChild(treeRootElement);

        // Setup File Search
        const searchInput = document.getElementById('file-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                filterTreeNodes(searchInput.value.trim().toLowerCase());
            });
        }
    }

    // Helper: sort folders first, then files alphabetically
    function sortTreeNodes(nodesObject) {
        return Object.values(nodesObject).sort((a, b) => {
            if (a.isFolder && !b.isFolder) return -1;
            if (!a.isFolder && b.isFolder) return 1;
            return a.name.localeCompare(b.name);
        });
    }

    function buildHtmlNodes(nodesArray, parentElement) {
        nodesArray.forEach(node => {
            const nodeContainer = document.createElement('div');
            nodeContainer.className = 'tree-node-wrapper';

            const nodeHeader = document.createElement('div');
            nodeHeader.className = `tree-node ${node.isFolder ? 'folder-node' : 'file-node'}`;
            nodeHeader.setAttribute('data-path', node.path);

            // Icons & Arrows
            let arrowHtml = '';
            let iconHtml = '';

            if (node.isFolder) {
                arrowHtml = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="arrow-icon">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                `;
                iconHtml = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="node-icon" style="color: #ffa800;">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                `;
            } else {
                arrowHtml = '<span style="width: 16px; display: inline-block;"></span>';
                iconHtml = getFileIcon(node.name);
            }

            nodeHeader.innerHTML = `
                <div class="tree-node-info">
                    ${arrowHtml}
                    ${iconHtml}
                    <span class="node-name">${node.name}</span>
                </div>
                ${node.isFolder ? '' : `<span class="node-size">${formatBytes(getFileSize(node.fileObj))}</span>`}
            `;

            nodeContainer.appendChild(nodeHeader);

            if (node.isFolder) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'tree-children';
                
                const sortedChildren = sortTreeNodes(node.children);
                buildHtmlNodes(sortedChildren, childrenContainer);
                nodeContainer.appendChild(childrenContainer);

                // Click event for folder collapse/expand
                nodeHeader.addEventListener('click', (e) => {
                    e.stopPropagation();
                    nodeHeader.classList.toggle('expanded');
                    childrenContainer.classList.toggle('show');
                });
            } else {
                // Click event to view file
                nodeHeader.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.tree-node.active-file').forEach(el => el.classList.remove('active-file'));
                    nodeHeader.classList.add('active-file');
                    loadFileContent(node.fileObj);
                });
            }

            parentElement.appendChild(nodeContainer);
        });
    }

    function getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        let color = '#3699ff'; // Default blue
        let pathData = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>'; // Doc icon

        if (['js', 'ts', 'jsx'].includes(ext)) {
            color = '#f7df1e'; // JS Yellow
            pathData = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18h2"></path>';
        } else if (ext === 'json') {
            color = '#10b981'; // Green
        } else if (['html', 'htm'].includes(ext)) {
            color = '#e34f26'; // HTML Orange
        } else if (ext === 'css') {
            color = '#1572b6'; // CSS Blue
        } else if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'ico'].includes(ext)) {
            color = '#a389f4'; // Purple
            pathData = '<circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>';
        } else if (['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(ext)) {
            color = '#ffa800'; // Amber
            pathData = '<path d="M4 7V4h16v3M9 20h6M12 4v16"></path>'; // Font icon
        } else if (['md', 'txt'].includes(ext)) {
            color = '#ffffff';
        }

        return `
            <svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" class="node-icon">
                ${pathData}
            </svg>
        `;
    }

    // Detect language class for Prism
    function detectLanguage(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const map = {
            'js': 'javascript',
            'jsx': 'jsx',
            'ts': 'typescript',
            'json': 'json',
            'html': 'html',
            'css': 'css',
            'md': 'markdown',
            'xml': 'xml',
            'svg': 'xml',
            'txt': 'none'
        };
        return map[ext] || 'none';
    }

    // Load file contents into viewer workspace
    async function loadFileContent(fileObj) {
        const welcome = document.getElementById('welcome-screen');
        const codeWrapper = document.getElementById('code-wrapper');
        const imageWrapper = document.getElementById('image-wrapper');
        const fontWrapper = document.getElementById('font-wrapper');
        const pathEl = document.getElementById('current-file-path');

        if (welcome) welcome.style.display = 'none';
        pathEl.textContent = `${fileObj.name} (${formatBytes(getFileSize(fileObj))})`;
        currentActiveFileObj = fileObj;

        const ext = fileObj.name.split('.').pop().toLowerCase();
        const isImage = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'ico'].includes(ext);
        const isFont = ['ttf', 'otf', 'woff', 'woff2', 'eot'].includes(ext);

        if (isImage) {
            if (prismWorker) {
                prismWorker.terminate();
                prismWorker = null;
            }
            isOnDemandHighlight = false;
            currentLanguage = 'none';
            codeWrapper.style.display = 'none';
            fontWrapper.style.display = 'none';
            imageWrapper.style.display = 'flex';

            const blob = await fileObj.async("blob");
            const url = URL.createObjectURL(blob);
            document.getElementById('image-preview').src = url;

            // Reset virtual scroll variables and UI
            visibleLines = [];
            totalLinesCount = 0;
            const spacer = document.getElementById('code-scroll-spacer');
            if (spacer) spacer.style.height = '0px';
            const viewport = document.getElementById('code-viewport');
            if (viewport) viewport.style.transform = 'translateY(0px)';
        } else if (isFont) {
            if (prismWorker) {
                prismWorker.terminate();
                prismWorker = null;
            }
            isOnDemandHighlight = false;
            currentLanguage = 'none';
            codeWrapper.style.display = 'none';
            imageWrapper.style.display = 'none';
            fontWrapper.style.display = 'block';

            // Reset virtual scroll variables and UI
            visibleLines = [];
            totalLinesCount = 0;
            const spacer = document.getElementById('code-scroll-spacer');
            if (spacer) spacer.style.height = '0px';
            const viewport = document.getElementById('code-viewport');
            if (viewport) viewport.style.transform = 'translateY(0px)';

            try {
                const blob = await fileObj.async("blob");

                // Generate font family name
                const fontFamilyName = 'font-preview-' + Date.now();
                registerDynamicFont(fontFamilyName, blob);

                // Setup custom test input and large text display
                const customTextEl = document.getElementById('font-custom-text');
                const largeDisplayEl = document.getElementById('font-large-display');
                if (customTextEl && largeDisplayEl) {
                    customTextEl.value = "The quick brown fox jumps over the lazy dog";
                    largeDisplayEl.textContent = "The quick brown fox jumps over the lazy dog";
                    customTextEl.oninput = (e) => {
                        const val = e.target.value.trim() || "The quick brown fox jumps over the lazy dog";
                        largeDisplayEl.textContent = val;
                    };
                }

                // Generate Glyph Grid
                const gridEl = document.getElementById('font-glyph-grid');
                if (gridEl) {
                    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
                    let gridHtml = "";
                    chars.forEach(char => {
                        gridHtml += `<div class="glyph-card font-preview-el">${char}</div>`;
                    });
                    gridEl.innerHTML = gridHtml;
                }

                // Apply the newly registered font family name to dynamic elements
                document.querySelectorAll('.font-preview-el').forEach(el => {
                    el.style.fontFamily = `'${fontFamilyName}', monospace`;
                });

            } catch (err) {
                console.error("Lỗi tải phông chữ:", err);
            }
        } else {
            imageWrapper.style.display = 'none';
            fontWrapper.style.display = 'none';
            codeWrapper.style.display = 'flex';
            
            // Show code loading overlay
            const loadingOverlay = document.getElementById('code-loading-overlay');
            if (loadingOverlay) loadingOverlay.style.display = 'flex';

            try {
                const text = await fileObj.async("string");
                const codeBlock = document.getElementById('code-block');
                
                // Terminate old worker and start a fresh one to abort any ongoing highlighting jobs
                if (prismWorker) {
                    prismWorker.terminate();
                }
                prismWorker = new Worker('prism-worker.js');

                currentLanguage = detectLanguage(fileObj.name);
                const fileSize = getFileSize(fileObj);
                const isTooLarge = fileSize > 200 * 1024; // 200 KB threshold

                // Update language badge
                const badge = document.getElementById('file-language-badge');
                if (badge) {
                    badge.textContent = isTooLarge ? `${currentLanguage.toUpperCase()} (TẢI TỪNG PHẦN)` : currentLanguage.toUpperCase();
                }

                // Show/hide auto-beautify toggle based on language support
                const toggleControl = document.querySelector('.toggle-control');
                const beautifiable = !isTooLarge && ['javascript', 'typescript', 'jsx', 'json', 'css', 'html'].includes(currentLanguage);
                if (toggleControl) {
                    toggleControl.style.display = beautifiable ? 'inline-flex' : 'none';
                }

                const toggleBeautify = document.getElementById('toggle-beautify');
                const isBeautifyChecked = beautifiable && toggleBeautify && toggleBeautify.checked;

                if (isTooLarge) {
                    isOnDemandHighlight = true;
                    showToast("Tệp lớn (>200KB), tự động chuyển sang chế độ tải từng phần để tăng tốc.", false);
                    
                    // Save raw text for instant Copy / Download
                    currentActiveFileText = text;
                    codeBlock.className = `language-${currentLanguage}`;

                    // Set virtual scroll data
                    visibleLines = text.split('\n');
                    totalLinesCount = visibleLines.length;

                    // Set spacer height to total virtual height
                    const spacer = document.getElementById('code-scroll-spacer');
                    if (spacer) {
                        spacer.style.height = (visibleLines.length * LINE_HEIGHT) + 'px';
                    }

                    // Reset container scroll to top
                    const container = document.getElementById('code-scroll-container');
                    if (container) {
                        container.scrollTop = 0;
                    }

                    // Perform initial virtual render
                    updateVirtualScroll();

                    // Hide loading overlay
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                } else {
                    isOnDemandHighlight = false;

                    // Send request to Worker
                    prismWorker.onmessage = function(event) {
                        if (currentActiveFileObj !== fileObj) return;

                        const { text: processedText, highlightedHtml, lineCount } = event.data;
                        
                        // Save processed text for instant Copy / Download
                        currentActiveFileText = processedText;
                        
                        codeBlock.className = `language-${currentLanguage}`;

                        // Set virtual scroll data
                        visibleLines = highlightedHtml.split('\n');
                        totalLinesCount = lineCount;

                        // Set spacer height to total virtual height
                        const spacer = document.getElementById('code-scroll-spacer');
                        if (spacer) {
                            spacer.style.height = (lineCount * LINE_HEIGHT) + 'px';
                        }

                        // Reset container scroll to top
                        const container = document.getElementById('code-scroll-container');
                        if (container) {
                            container.scrollTop = 0;
                        }

                        // Perform initial virtual render
                        updateVirtualScroll();

                        // Hide loading overlay
                        if (loadingOverlay) loadingOverlay.style.display = 'none';
                    };

                    prismWorker.postMessage({
                        text,
                        lang: currentLanguage,
                        beautify: isBeautifyChecked
                    });
                }

            } catch (e) {
                console.error("Lỗi đọc file:", e);
                document.getElementById('code-block').textContent = `Lỗi: Không thể hiển thị nội dung tệp tin này (${e.message})`;
                const gutter = document.getElementById('line-numbers-gutter');
                if (gutter) gutter.style.display = 'none';
                if (loadingOverlay) loadingOverlay.style.display = 'none';
            }
        }
    }

    // Filter file tree on search
    function filterTreeNodes(query) {
        const allNodes = document.querySelectorAll('.tree-node-wrapper');
        
        if (!query) {
            // Restore everything
            allNodes.forEach(wrapper => {
                const node = wrapper.querySelector('.tree-node');
                const children = wrapper.querySelector('.tree-children');
                wrapper.style.display = 'block';
                node.classList.remove('expanded');
                if (children) children.classList.remove('show');
            });
            return;
        }

        allNodes.forEach(wrapper => {
            const nameEl = wrapper.querySelector('.node-name');
            const nameText = nameEl.textContent.toLowerCase();
            const node = wrapper.querySelector('.tree-node');

            if (node.classList.contains('file-node')) {
                const isMatch = nameText.includes(query);
                wrapper.style.display = isMatch ? 'block' : 'none';

                if (isMatch) {
                    // Expand all parent folders
                    let parent = wrapper.parentElement;
                    while (parent && parent.classList.contains('tree-children')) {
                        parent.classList.add('show');
                        const parentHeader = parent.previousElementSibling;
                        if (parentHeader) parentHeader.classList.add('expanded');
                        parent.parentElement.style.display = 'block'; // Make parent folder block visible
                        parent = parent.parentElement.parentElement;
                    }
                }
            } else {
                // Folders default to none unless they have visible children
                wrapper.style.display = 'block';
            }
        });

        // Hide empty folders
        document.querySelectorAll('.tree-node-wrapper').forEach(wrapper => {
            const node = wrapper.querySelector('.tree-node');
            if (node.classList.contains('folder-node')) {
                const childrenContainer = wrapper.querySelector('.tree-children');
                const hasVisibleChildren = Array.from(childrenContainer.children).some(c => c.style.display !== 'none');
                wrapper.style.display = hasVisibleChildren ? 'block' : 'none';
            }
        });
    }

    // Setup action buttons to download ZIP / CRX
    function setupDownloadActions(id) {
        const btnZip = document.getElementById('btn-download-zip');
        const btnCrx = document.getElementById('btn-download-crx');

        btnZip.addEventListener('click', () => {
            if (!cleanZipBuffer) return;
            const blob = new Blob([cleanZipBuffer], { type: 'application/zip' });
            triggerDownload(blob, `${id}.zip`);
        });

        btnCrx.addEventListener('click', () => {
            if (!originalCrxBuffer) return;
            const blob = new Blob([originalCrxBuffer], { type: 'application/octet-stream' });
            triggerDownload(blob, `${id}.crx`);
        });
    }



    function showError(message) {
        const container = document.getElementById('file-tree-container');
        container.innerHTML = `
            <div class="loading-state" style="color: var(--primary-blue);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 32px; height: 32px; color: #ff0000; margin-bottom: 8px;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span style="font-weight: 600; color: #ffffff;">Lỗi Tải Nguồn</span>
                <span style="color: var(--text-secondary); max-width: 220px; line-height: 1.4;">${message}</span>
            </div>
        `;
    }

    // File Actions: Copy and Download File
    async function copyCurrentFile() {
        if (!currentActiveFileText) return;
        try {
            await navigator.clipboard.writeText(currentActiveFileText);
            showToast("Đã sao chép nội dung tệp tin!");
        } catch (err) {
            console.error("Lỗi sao chép:", err);
            showToast("Lỗi khi sao chép tệp tin.", false);
        }
    }

    async function downloadCurrentFile() {
        if (!currentActiveFileObj || !currentActiveFileText) return;
        try {
            const ext = currentActiveFileObj.name.split('.').pop().toLowerCase();
            const isImage = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'ico'].includes(ext);
            let blob;
            if (isImage) {
                blob = await currentActiveFileObj.async("blob");
            } else {
                blob = new Blob([currentActiveFileText], { type: 'text/plain;charset=utf-8' });
            }
            const filename = currentActiveFileObj.name.split('/').pop();
            triggerDownload(blob, filename);
            showToast("Đã tải xuống tệp tin!");
        } catch (err) {
            console.error("Lỗi tải tệp:", err);
            showToast("Lỗi khi tải tệp tin.", false);
        }
    }

    function showToast(message, isSuccess = true) {
        const existing = document.querySelector('.file-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'file-toast';
        if (!isSuccess) {
            toast.style.borderLeftColor = '#f44336';
        }
        
        const iconHtml = isSuccess 
            ? `<svg viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" style="width: 16px; height: 16px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`
            : `<svg viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="2.5" style="width: 16px; height: 16px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

        toast.innerHTML = `
            ${iconHtml}
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'opacity 0.2s, transform 0.2s';
            setTimeout(() => toast.remove(), 200);
        }, 2000);
    }

    // Custom Virtual Scroll Engine
    function updateVirtualScroll() {
        const container = document.getElementById('code-scroll-container');
        if (!container || totalLinesCount === 0) return;

        const scrollTop = container.scrollTop;
        const clientHeight = container.clientHeight;

        // Calculate active rendering window (visible + buffer)
        let startIndex = Math.floor(scrollTop / LINE_HEIGHT) - BUFFER_LINES;
        startIndex = Math.max(0, startIndex);

        let endIndex = Math.ceil((scrollTop + clientHeight) / LINE_HEIGHT) + BUFFER_LINES;
        endIndex = Math.min(totalLinesCount, endIndex);

        // Render visible lines only
        const activeLines = visibleLines.slice(startIndex, endIndex);
        const codeBlock = document.getElementById('code-block');
        if (codeBlock) {
            if (isOnDemandHighlight && currentLanguage !== 'none') {
                const activeText = activeLines.join('\n');
                const prismLang = Prism.languages[currentLanguage];
                if (prismLang) {
                    codeBlock.innerHTML = Prism.highlight(activeText, prismLang, currentLanguage);
                } else {
                    codeBlock.textContent = activeText;
                }
            } else if (isOnDemandHighlight && currentLanguage === 'none') {
                codeBlock.textContent = activeLines.join('\n');
            } else {
                codeBlock.innerHTML = activeLines.join('\n');
            }
        }

        // Render visible line numbers in gutter
        const gutter = document.getElementById('line-numbers-gutter');
        if (gutter) {
            const numbers = [];
            for (let i = startIndex + 1; i <= endIndex; i++) {
                numbers.push(i);
            }
            gutter.textContent = numbers.join('\n');
            gutter.style.display = 'block';
        }

        // Translate viewport to align with scrollbar
        const viewport = document.getElementById('code-viewport');
        if (viewport) {
            const offsetY = startIndex * LINE_HEIGHT;
            viewport.style.transform = `translateY(${offsetY}px)`;
        }
    }

    let currentFontStylesheet = null;
    let prevFontUrl = null;

    function registerDynamicFont(fontFamilyName, blob) {
        if (prevFontUrl) {
            URL.revokeObjectURL(prevFontUrl);
        }
        
        const fontUrl = URL.createObjectURL(blob);
        prevFontUrl = fontUrl;

        if (!currentFontStylesheet) {
            currentFontStylesheet = document.createElement('style');
            document.head.appendChild(currentFontStylesheet);
        }

        currentFontStylesheet.textContent = `
            @font-face {
                font-family: '${fontFamilyName}';
                src: url('${fontUrl}');
            }
        `;

        document.querySelectorAll('.font-preview-el').forEach(el => {
            el.style.fontFamily = `'${fontFamilyName}', monospace`;
        });
    }

    // Helper: get uncompressed file size from JSZip object
    function getFileSize(fileObj) {
        if (!fileObj) return 0;
        if (fileObj._data && typeof fileObj._data.uncompressedSize === 'number') {
            return fileObj._data.uncompressedSize;
        }
        if (fileObj.uncompressedSize !== undefined) {
            return fileObj.uncompressedSize;
        }
        return 0;
    }

    // Helper: format bytes to human-readable size
    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
});
