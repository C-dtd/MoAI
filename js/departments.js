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
 * @param {string} departmentName - 표시할 부서의 ID
 */
async function showUsers(departmentName) {
    const query = departmentName.toLowerCase();
    const userContainer = document.querySelector('#user-container>main');
    const userCards = userContainer.querySelectorAll('.user-card');
    const noResultsMessage = userContainer.querySelector('.no-results-message');

    let anyVisible = false;

    // 모든 사용자 카드 필터링
    userCards.forEach(card => {
        const depElement = card.querySelector('.user-info .dep');
        if (depElement) {
            const name = depElement.textContent.toLowerCase();
            console.log(name, query);
            if (name === query) {
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
        noResultsMessage.style.display = 'block';
    } else {
        noResultsMessage.style.display = 'none';
    }
}

/**
 * 사용자 이름으로 검색하여 필터링합니다.
 */
function searchUsers() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const userContainer = document.querySelector('#user-container>main');
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
        noResultsMessage.style.display = 'block';
    } else {
        noResultsMessage.style.display = 'none';
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


const chat_main = document.querySelector('.user-container>main');
chat_main.addEventListener('scroll', ()=> {
    const scroll = document.querySelector('.scroll');
    scroll.style.top = `${chat_main.scrollTop/(chat_main.scrollHeight -chat_main.clientHeight +32) *(chat_main.scrollHeight - scroll.clientHeight +32)}px`;
});