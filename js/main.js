let sidebarOpen = true;

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarOpen) {
        sidebar.classList.add('sidebar-hidden');
    } else {
        sidebar.classList.remove('sidebar-hidden');
    }
    
    sidebarOpen = !sidebarOpen;
}

const imgModal = document.querySelector('#img-modal');
const modalContent = document.querySelector('#modal-content');

function modalOpen(src) {
    imgModal.style.display = 'flex';
    modalContent.setAttribute('src', src);
}

imgModal.addEventListener('click', () => {
    imgModal.style.display = 'none';
});

function showCalendar() {
    document.querySelector('#main-iframe').setAttribute('src', '/calendar');
}

function showChat() {
    document.querySelector('#main-iframe').setAttribute('src', '/chatroomframe');
}

function showDocumentSummary() {
    document.querySelector('#main-iframe').setAttribute('src', '/documentsummary');
}

function showDepartments() {
    document.querySelector('#main-iframe').setAttribute('src', '/departments');
}

function showPayment() {
    document.querySelector('#main-iframe').setAttribute('src', '/payment');
}

function showCreatereport() {
    document.querySelector('#main-iframe').setAttribute('src', '/createreport');
}

function showSetting() {
    document.querySelector('#main-iframe').setAttribute('src', '/setting');
}

// 오른쪽 섹션 (채팅/메모) 토글 기능 추가
function toggleRightSection() {
    const rightSection = document.getElementById('right-section');
    const toggleIcon = document.getElementById('sidebar-toggle-icon');

    if (rightSection.style.display === 'none' || rightSection.style.display === '') {
        rightSection.style.display = 'flex';
        toggleIcon.src = '/image/sidebar.png'; // 아이콘을 닫기 모양으로 변경 close로 변경
    } else {
        rightSection.style.display = 'none';
        toggleIcon.src = '/image/sidebar.png'; // 아이콘을 열기 모양으로 변경
    }
}
