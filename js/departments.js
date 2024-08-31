/**
 * 부서 목록을 동적으로 생성하고 표시합니다.
 */
function showDepartments() {
    const container = document.getElementById('departments-container');
    container.innerHTML = '';

    departments.forEach(department => {
        const departmentDiv = document.createElement('div');
        departmentDiv.className = 'department-item';
        departmentDiv.textContent = department.dep_name;
        departmentDiv.onclick = () => showUsers(department.dep_id);
        container.appendChild(departmentDiv);
    });

    container.style.display = 'block';
}

/**
 * 주어진 부서 ID에 해당하는 사용자 목록을 표시합니다.
 * @param {string} departmentId - 표시할 부서의 ID
 */
function showUsers(departmentId) {
    const userContainer = document.getElementById('user-container');
    userContainer.innerHTML = '';

    const filteredUsers = users.filter(user => user.dep_id === departmentId || user.dep_id === 'undefined');

    filteredUsers.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';

        const img = document.createElement('img');
        img.className = 'profile-pic';
        img.dataset.src = `/images/${user.image}`;
        img.alt = `${user.user_name}의 프로필 사진`;

        const info = document.createElement('div');
        info.className = 'user-info';
        info.innerHTML = `<p><strong>${user.user_name}</strong><br>${user.phone}</p>`;

        userCard.appendChild(img);
        userCard.appendChild(info);
        userContainer.appendChild(userCard);
    });

    // 초기화 검색 필드 및 상태
    document.getElementById('search-input').value = '';
    searchUsers();
}

/**
 * 사용자 이름으로 검색하여 필터링합니다.
 */
function searchUsers() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const userContainer = document.getElementById('user-container');
    const userCards = userContainer.querySelectorAll('.user-card');
    const noResultsMessage = userContainer.querySelector('.no-results-message');

    let anyVisible = false;

    // 모든 사용자 카드 필터링
    userCards.forEach(card => {
        const nameElement = card.querySelector('.user-info p strong');
        if (nameElement) {
            const name = nameElement.textContent.toLowerCase();
            if (name.includes(query)) {
                card.style.display = 'flex';  // 검색 쿼리에 맞는 카드 표시
                anyVisible = true;
            } else {
                card.style.display = 'none';  // 검색 쿼리에 맞지 않는 카드 숨김
            }
        } else {
            card.style.display = 'none';  // 사용자 카드에 이름 요소가 없는 경우 숨김
        }
    });

    // 검색 결과가 없는 경우 메시지 표시
    if (!anyVisible) {
        if (!noResultsMessage) {
            // 메시지 요소가 없으면 추가
            const message = document.createElement('p');
            message.className = 'no-results-message';
            message.textContent = '검색 결과가 없습니다.';
            userContainer.appendChild(message);
        } else {
            noResultsMessage.style.display = 'block';
        }
    } else {
        // 검색 결과가 있는 경우 메시지 숨김
        if (noResultsMessage) {
            noResultsMessage.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.profile-pic');

    images.forEach(img => {
        img.classList.add('loading');

        img.addEventListener('load', () => {
            img.classList.remove('loading');
        });

        img.addEventListener('error', () => {
            img.classList.remove('loading');
        });

        img.src = img.dataset.src;
    });

    // 검색 입력 필드에서 input 이벤트를 사용할 때 검색 실행
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        searchUsers();
    });

    // 검색 버튼 클릭 시 검색 실행
    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', () => {
        searchUsers();
    });
});

/**
 * 사용자의 채팅방을 시작합니다.
 * @param {string} userId - 채팅을 시작할 사용자의 ID
 */
function startChat(userId) {
    // 채팅방을 새 창으로 열기
    window.open(`/chat?user=${userId}`, '_blank');

    // 또는 모달을 사용하여 채팅을 시작할 수도 있음
    // 예: openChatModal(userId);
}



