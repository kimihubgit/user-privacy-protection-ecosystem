// qrScanner.js
// Handles local QR code decoding using jsQR, image uploads, paste actions, and Chrome tab capture.

export const processQrImage = (fileOrDataUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (typeof jsQR !== 'undefined') {
          const decoded = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          if (decoded && decoded.data) {
            resolve(decoded.data);
          } else {
            reject(new Error("Không tìm thấy mã QR nào trong hình ảnh."));
          }
        } else {
          reject(new Error("Thư viện quét QR chưa sẵn sàng."));
        }
      } catch (err) {
        console.error(err);
        reject(new Error("Lỗi khi xử lý hình ảnh."));
      }
    };
    img.onerror = () => {
      reject(new Error("Không thể tải hình ảnh."));
    };
    
    if (fileOrDataUrl instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(fileOrDataUrl);
    } else {
      img.src = fileOrDataUrl;
    }
  });
};

export const scanCurrentTabQr = () => {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) {
          reject(new Error("Không thể xác định tab hiện tại."));
          return;
        }
        
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
          if (chrome.runtime.lastError || !dataUrl) {
            reject(new Error("Không thể chụp màn hình. Hãy đảm bảo Extension được cấp quyền."));
            return;
          }
          processQrImage(dataUrl).then(resolve).catch(reject);
        });
      });
    } catch (err) {
      reject(err);
    }
  });
};
