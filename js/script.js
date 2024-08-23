const SUPABASE_URL = 'https://vpcdvbdktvvzrvjfyyzm.supabase.co'; // Supabase URL
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwY2R2YmRrdHZ2enJ2amZ5eXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQwNDYxMzEsImV4cCI6MjAzOTYyMjEzMX0.k2qUZ32KCJcd3BoHXDRZKH65r5hlhxLjNeDea0ta4-8'; // Supabase API Key
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

class Document {
    constructor(docId, fileName, content, creator) {
        this.docId = docId;
        this.fileName = fileName;
        this.content = content;
        this.creator = creator;
        this.approvals = [];
        this.status = "Pending";
        this.renderStatus();
        this.renderDocumentInfo();
    }

    requestApproval(approver) {
        this.approvals.push({ approver: approver, status: "Pending" });
        this.renderApprovals();
        console.log(`Approval requested from ${approver} for document ID ${this.docId}`);
    }

    approve(approver) {
        for (let approval of this.approvals) {
            if (approval.approver === approver) {
                approval.status = "Approved";
                console.log(`Document ID ${this.docId} approved by ${approver}`);
                break;
            }
        }
        this.updateStatus();
        this.renderApprovals();
    }

    reject(approver) {
        for (let approval of this.approvals) {
            if (approval.approver === approver) {
                approval.status = "Rejected";
                console.log(`Document ID ${this.docId} rejected by ${approver}`);
                this.status = "Rejected";
                break;
            }
        }
        this.renderApprovals();
        this.renderStatus();
    }

    updateStatus() {
        if (this.approvals.every(approval => approval.status === "Approved")) {
            this.status = "Approved";
        } else if (this.approvals.some(approval => approval.status === "Rejected")) {
            this.status = "Rejected";
        } else {
            this.status = "Pending";
        }
        this.renderStatus();
    }

    getStatus() {
        return this.status;
    }

    renderApprovals() {
        const approvalList = document.getElementById("approval-list");
        approvalList.innerHTML = "";
        this.approvals.forEach(approval => {
            const li = document.createElement("li");
            li.innerHTML = `${approval.approver}: ${approval.status} <a href="#" onclick="viewDocumentAndApprove('${approval.approver}')">View and Approve/Reject</a>`;
            li.classList.add(approval.status.toLowerCase());
            approvalList.appendChild(li);
        });
    }

    renderStatus() {
        document.getElementById("status").textContent = this.status;
    }

    renderDocumentInfo() {
        document.getElementById("docName").textContent = this.fileName;
    }

    viewDocument(approver) {
        const image = new Image();
        image.src = URL.createObjectURL(new Blob([this.content], { type: 'image/png' }));
        image.onload = () => {
            const canvas = document.getElementById("drawingCanvas");
            const ctx = canvas.getContext("2d");

            // 캔버스를 이미지 크기에 맞게 조정
            canvas.width = image.width;
            canvas.height = image.height;

            // 이미지 표시
            ctx.drawImage(image, 0, 0);

            // 이미지 뷰어 표시
            document.getElementById("imageViewer").style.display = "flex";
        };

        // 저장 승인자의 이름을 모달에서 접근할 수 있도록 설정
        document.getElementById("imageViewer").setAttribute("data-approver", approver);
    }
}

let doc1;
let currentApprover;

// 문서 업로드 함수
function uploadDocument() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (file) {
        const allowedExtensions = /(\.png|\.pdf|\.txt|\.md|\.csv|\.json)$/i;

        if (!allowedExtensions.exec(file.name)) {
            alert("Only .png, .pdf, .txt, .md, .csv, or .json files are allowed.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;
            document.getElementById("fileName").textContent = `Uploaded: ${file.name}`;
            doc1 = new Document(1, file.name, content, "Alice");

            // Show the document section
            document.getElementById("documentSection").classList.remove("hidden");

            // Hide the completion section initially
            document.getElementById("completionSection").classList.add("hidden");
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert("Please select a file to upload.");
    }
}

// 승인 요청 함수
function requestApproval(approver) {
    if (doc1) {
        doc1.requestApproval(approver);
    } else {
        alert("Please upload a document first.");
    }
}

// 문서 및 승인 기능 뷰어 열기
function viewDocumentAndApprove(approver) {
    if (doc1) {
        doc1.viewDocument(approver);
        currentApprover = approver;
    } else {
        alert("Please upload a document first.");
    }
}

// 그리기 시작 함수
function startDrawing() {
    const canvas = document.getElementById("drawingCanvas");
    const ctx = canvas.getContext("2d");

    let drawing = false;

    canvas.addEventListener('mousedown', () => {
        drawing = true;
        ctx.beginPath();
    });

    canvas.addEventListener('mouseup', () => {
        drawing = false;
        ctx.closePath();
    });

    canvas.addEventListener('mousemove', (event) => {
        if (!drawing) return;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';

        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
    });
}

// 낙서 저장 함수
function saveDrawing() {
    const canvas = document.getElementById("drawingCanvas");
    return canvas.toDataURL("image/png");
}

// 문서 승인 처리 함수
function approveDocumentModal() {
    if (currentApprover && doc1) {
        const drawingImage = saveDrawing(); // 그린 내용을 저장
        const approvedMessage = "Document approved and drawing saved.";

        // 이미지와 메시지를 웹페이지에 업로드
        updateCompletionSection(approvedMessage, drawingImage);

        doc1.approve(currentApprover);
        closeImageModal();
    }
}

// 문서 거부 처리 함수
function rejectDocumentModal() {
    if (currentApprover && doc1) {
        doc1.reject(currentApprover);
        updateCompletionSection("Document rejected.");
        closeImageModal();
    }
}

// 처리 완료 메시지 업데이트 함수
function updateCompletionSection(message, imageSrc) {
    document.getElementById("completionMessage").textContent = message;
    document.getElementById("completionSection").classList.remove("hidden");

    if (imageSrc) {
        const completionImage = document.getElementById("completionImage");
        completionImage.src = imageSrc;
        completionImage.classList.remove("hidden");
    }
}

// 세부 사항 보기 버튼 함수
function toggleCompletionDetails() {
    const detailsSection = document.getElementById("completionDetails");
    detailsSection.classList.toggle("hidden");
}

// 모달 닫기 함수
function closeImageModal() {
    document.getElementById("imageViewer").style.display = "none";
}
