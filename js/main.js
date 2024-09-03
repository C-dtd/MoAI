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

function showKanban() {
    document.querySelector('#main-iframe').setAttribute('src', '/kanban');
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

function userProfileUpdate(src) {
    const profileImg = document.querySelector('.user-avatar');
    profileImg.setAttribute('src', src);
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

document.addEventListener('DOMContentLoaded', () => {
    const imageUrl = localStorage.getItem('profileImageUrl');
    if (imageUrl) {
        document.querySelector('.user-avatar').src = imageUrl;
    }
});

window.addEventListener('message', (event) => {
    if (event.data.type === 'updateProfileImage') {
        const imageUrl = event.data.imageUrl;
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            userAvatar.src = imageUrl;
        }
    }
});