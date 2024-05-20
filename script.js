document.getElementById('applyWatermark').addEventListener('click', function() {
    const imageInput = document.getElementById('imageInput').files[0];
    const watermarkImageInput = document.getElementById('watermarkImageInput').files[0];

    if (imageInput && watermarkImageInput) {
        const canvas = document.getElementById('imageCanvas');
        const ctx = canvas.getContext('2d');
        const reader = new FileReader();

        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const readerWatermark = new FileReader();
                readerWatermark.onload = function(eventWatermark) {
                    const watermarkImg = new Image();
                    watermarkImg.onload = function() {
                        const watermarkCanvas = document.createElement('canvas');
                        watermarkCanvas.width = watermarkImg.width;
                        watermarkCanvas.height = watermarkImg.height;
                        const watermarkCtx = watermarkCanvas.getContext('2d');
                        watermarkCtx.drawImage(watermarkImg, 0, 0);
                        const watermarkImageData = watermarkCtx.getImageData(0, 0, watermarkImg.width, watermarkImg.height);
                        embedWatermark(ctx, canvas.width, canvas.height, watermarkImageData);
                        const dataUrl = canvas.toDataURL('image/png');
                        const downloadLink = document.getElementById('downloadLink');
                        downloadLink.href = dataUrl;
                        downloadLink.download = 'watermarked_image.png';
                        downloadLink.style.display = 'block';
                        downloadLink.textContent = 'Unduh Gambar Watermarked';
                    };
                    watermarkImg.src = eventWatermark.target.result;
                };
                readerWatermark.readAsDataURL(watermarkImageInput);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(imageInput);
    } else {
        alert('Mohon pilih gambar host dan gambar watermark.');
    }
});

document.getElementById('extractWatermark').addEventListener('click', function() {
    const imageInput = document.getElementById('watermarkedImageInput').files[0];

    if (imageInput) {
        const canvas = document.getElementById('imageCanvas');
        const ctx = canvas.getContext('2d');
        const reader = new FileReader();

        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                const extractedImageData = extractWatermark(ctx, canvas.width, canvas.height);
                const extractedCanvas = document.createElement('canvas');
                extractedCanvas.width = extractedImageData.width;
                extractedCanvas.height = extractedImageData.height;
                extractedCanvas.getContext('2d').putImageData(extractedImageData, 0, 0);
                const extractedDataUrl = extractedCanvas.toDataURL('image/png');
                document.getElementById('extractedWatermark').textContent = 'Watermark berhasil diekstrak:';
                const extractedImg = new Image();
                extractedImg.src = extractedDataUrl;
                document.getElementById('extractedWatermark').appendChild(extractedImg);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(imageInput);
    } else {
        alert('Mohon unggah gambar yang telah diberi watermark.');
    }
});

function embedWatermark(ctx, width, height, watermarkImageData) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const watermarkData = watermarkImageData.data;

    for (let i = 0, j = 0; i < data.length && j < watermarkData.length; i += 4, j += 4) {
        data[i] = (data[i] & 254) | ((watermarkData[j] & 128) >> 7);
        data[i + 1] = (data[i + 1] & 254) | ((watermarkData[j + 1] & 128) >> 7);
        data[i + 2] = (data[i + 2] & 254) | ((watermarkData[j + 2] & 128) >> 7);
    }

    ctx.putImageData(imageData, 0, 0);
}

function extractWatermark(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const watermarkData = new Uint8ClampedArray(data.length);

    for (let i = 0; i < data.length; i += 4) {
        watermarkData[i] = (data[i] & 1) ? 255 : 0;
        watermarkData[i + 1] = (data[i + 1] & 1) ? 255 : 0;
        watermarkData[i + 2] = (data[i + 2] & 1) ? 255 : 0;
        watermarkData[i + 3] = 255;
    }

    return new ImageData(watermarkData, width, height);
}