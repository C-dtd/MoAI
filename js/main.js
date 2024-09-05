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

function menuDeactiveAll(num) {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach((menuItem, i) => {
        menuItem.classList.remove('active');
        if (i == num) {
            menuItem.classList.add('active');
        }
    });
}

function showCalendar() {
    document.querySelector('#main-iframe').setAttribute('src', '/calendar');
    menuDeactiveAll(0);
}

function showChat() {
    document.querySelector('#main-iframe').setAttribute('src', '/chatroomframe');
    menuDeactiveAll(1);
}

function showKanban() {
    document.querySelector('#main-iframe').setAttribute('src', '/kanban');
    menuDeactiveAll(2);
}

function showDepartments() {
    document.querySelector('#main-iframe').setAttribute('src', '/departments');
    menuDeactiveAll(3);
}

function showDocumentSummary() {
    document.querySelector('#main-iframe').setAttribute('src', '/documentsummary');
    menuDeactiveAll(4);
}

function showAichat() {
    document.querySelector('#main-iframe').setAttribute('src', '/aichat');
    menuDeactiveAll(5);
}

function showPayment() {
    document.querySelector('#main-iframe').setAttribute('src', '/payment');
    menuDeactiveAll(6);
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
    const tooltip = document.getElementById('sidebar-tooltip');

    if (rightSection.style.display === 'none' || rightSection.style.display === '') {
        rightSection.style.display = 'flex';
        toggleIcon.src = '/image/sidebar.png'; // 아이콘을 닫기 모양으로 변경 close로 변경
        tooltip.textContent = '사이드바 닫기';
    } else {
        rightSection.style.display = 'none';
        toggleIcon.src = '/image/sidebar.png'; // 아이콘을 열기 모양으로 변경
        tooltip.textContent = '사이드바 열기';
    }
}

// document.addEventListener('DOMContentLoaded', () => {
//     const imageUrl = localStorage.getItem('profileImageUrl');
//     if (imageUrl) {
//         document.querySelector('.user-avatar').src = imageUrl;
//     }
// });

window.addEventListener('message', (event) => {
    if (event.data.type === 'updateProfileImage') {
        const imageUrl = event.data.imageUrl;
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            userAvatar.src = imageUrl;
        }
    }
});
