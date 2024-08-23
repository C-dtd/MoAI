document.addEventListener('DOMContentLoaded', () => {
    // Set the path to the PDF.js worker script
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.1.81/pdf.worker.min.js';

    const fileInput = document.getElementById('fileInput');
    const uploadButton = document.getElementById('uploadButton');
    const viewButton = document.getElementById('viewButton');
    const modalDrawButton = document.getElementById('modalDrawButton');
    const modalDownloadButton = document.getElementById('modalDownloadButton');
    const modalCanvas = document.getElementById('modalCanvas');
    const fileModal = document.getElementById('fileModal');
    const closeModal = document.querySelector('.close');
    const ctx = modalCanvas.getContext('2d');

    let uploadedFile = null;
    let isDrawing = true;
    let lastX = 0;
    let lastY = 0;
    let ratio = 1;

    function initializeCanvas() {
        modalCanvas.addEventListener('mousedown', (e) => {
            if (isDrawing) {
                lastX = e.offsetX;
                lastY = e.offsetY;
                modalCanvas.addEventListener('mousemove', draw);
                console.log(ratio);
            }
        });

        modalCanvas.addEventListener('mouseup', () => {
            modalCanvas.removeEventListener('mousemove', draw);
        });

        modalCanvas.addEventListener('mouseleave', () => {
            modalCanvas.removeEventListener('mousemove', draw);
        });
    }

    function draw(e) {
        if (isDrawing) {
            ctx.beginPath();
            ctx.moveTo(lastX/ratio, lastY/ratio);
            ctx.lineTo(e.offsetX/ratio, e.offsetY/ratio);
            ctx.strokeStyle = 'red'; // Color of the drawing
            ctx.lineWidth = 2; // Thickness of the drawing
            ctx.stroke();
            lastX = e.offsetX;
            lastY = e.offsetY;
        }
    }

    async function renderPDF(file) {
        const fileReader = new FileReader();
        fileReader.onload = async () => {
            const typedarray = new Uint8Array(fileReader.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1 });

            if (viewport.width > window.innerWidth*0.8) {
                ratio = window.innerWidth*0.8/viewport.width;
            } else {
                ratio = 1;
            }

            modalCanvas.height = viewport.height;
            modalCanvas.width = viewport.width;
            modalCanvas.style = `width: ${viewport.width *ratio}px;`;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            await page.render(renderContext).promise;

            initializeCanvas();
        };
        fileReader.readAsArrayBuffer(file);
    }

    function renderPNG(file) {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                if (img.width > window.innerWidth *0.8) {
                    ratio = window.innerWidth*0.8/img.width;
                } else {
                    ratio = 1;
                }
                modalCanvas.width = img.width;
                modalCanvas.height = img.height;
                modalCanvas.style = `width: ${img.width *ratio}px;`;
                ctx.drawImage(img, 0, 0);
                initializeCanvas();
            };
            img.src = e.target.result;
        };
        fileReader.readAsDataURL(file);
    }

    async function applyDrawingToPDF() {
        const pdfDoc = await PDFLib.PDFDocument.create();
        const existingPdfBytes = await fetch(URL.createObjectURL(uploadedFile)).then(res => res.arrayBuffer());
        const existingPdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
        const [firstPage] = await pdfDoc.copyPages(existingPdfDoc, [0]);
        pdfDoc.addPage(firstPage);
        
        // Get image data from canvas
        const imgData = modalCanvas.toDataURL('image/png');
        const pngImage = await pdfDoc.embedPng(imgData);

        // Set page dimensions to match the canvas
        const page = pdfDoc.getPages()[0];
        page.setSize(modalCanvas.width, modalCanvas.height);

        // Draw the image on the page
        page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: modalCanvas.width,
            height: modalCanvas.height,
        });

        return pdfDoc;
    }

    function applyDrawingToPNG() {
        return new Promise((resolve) => {
            const imgData = modalCanvas.toDataURL('image/png');
            const img = new Image();
            img.onload = () => {
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                tempCtx.drawImage(img, 0, 0);
                tempCtx.drawImage(modalCanvas, 0, 0);
                const newImgData = tempCanvas.toDataURL('image/png');
                resolve(newImgData);
            };
            img.src = imgData;
        });
    }

    fileInput.addEventListener('input', () => {
        uploadedFile = fileInput.files[0];
        if (uploadedFile) {
            if (uploadedFile.type === 'application/pdf') {
                renderPDF(uploadedFile);
            } else if (uploadedFile.type === 'image/png') {
                renderPNG(uploadedFile);
            } else {
                alert('지원되지 않는 파일 형식입니다. PDF 또는 PNG 파일을 업로드하세요.');
            }
            fileModal.style.display = 'block';
            if (uploadedFile.type === 'application/pdf') {
                renderPDF(uploadedFile);
            } else if (uploadedFile.type === 'image/png') {
                renderPNG(uploadedFile);
            }
        } else {
            alert('파일을 선택하세요.');
        }
    });

    // modalDrawButton.addEventListener('click', () => {
    //     isDrawing = !isDrawing;
    //     modalDrawButton.textContent = isDrawing ? '그리기 종료' : '연필';
    // });

    modalDownloadButton.addEventListener('click', async () => {
        if (uploadedFile) {
            if (uploadedFile.type === 'application/pdf') {
                try {
                    const pdfDoc = await applyDrawingToPDF();
                    const pdfBytes = await pdfDoc.save();
                    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'modified.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (error) {
                    console.error('Error generating PDF:', error);
                }
            } else if (uploadedFile.type === 'image/png') {
                try {
                    const newImgData = await applyDrawingToPNG();
                    const link = document.createElement('a');
                    link.href = newImgData;
                    link.download = 'modified.png';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } catch (error) {
                    console.error('Error generating PNG:', error);
                }
            }
        } else {
            alert('먼저 파일을 업로드하고 수정하세요.');
        }
    });

    closeModal.addEventListener('click', () => {
        fileModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === fileModal) {
            fileModal.style.display = 'none';
        }
    });
});





































