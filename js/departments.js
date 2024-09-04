document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = document.body.dataset.admin === 'true';
    
    showDepartments();

    // 부서 목록을 표시합니다.
    function showDepartments() {
        const container = document.getElementById('departments-container');
        container.innerHTML = ''; // 부서 목록 초기화

        fetch('/departmentList')
            .then(response => response.json())
            .then(data => {
                const departments = data.departments;
                if (!Array.isArray(departments) || departments.length === 0) {
                    container.innerHTML = '<p>부서 데이터가 없습니다.</p>';
                    return;
                }

                departments.forEach(department => {
                    const departmentItem = document.createElement('article');
                    departmentItem.className = 'department-item';
                    departmentItem.dataset.id = department.dep_id;
                    departmentItem.textContent = department.dep_name;
                    departmentItem.onclick = () => loadUsersByDepartment(department.dep_name);

                    if (isAdmin) {
                        const deleteButton = document.createElement('button');
                        deleteButton.className = 'delete-department-button';
                        deleteButton.textContent = '삭제';
                        deleteButton.onclick = (event) => {
                            event.stopPropagation();
                            deleteDepartment(department.dep_id);
                        };
                        departmentItem.appendChild(deleteButton);
                    }

                    container.appendChild(departmentItem);
                });

                if (isAdmin) {
                    const div = document.createElement('div');
                    div.className = "department-buttons";
                    const button = document.createElement('button');
                    button.className = "add-department-button";
                    button.id = "add-department-button";
                    button.innerText = "부서 추가";
                    button.addEventListener('click', showAddDepartmentForm);
                    div.appendChild(button);
                    container.appendChild(div);
                }
            })
            .catch(error => {
                console.error('부서 목록 가져오기 실패:', error);
                container.innerHTML = '<p>부서 목록을 가져오는 데 실패했습니다.</p>';
            });
    }

    function addDepartment(dep_name) {
        fetch('/add-department', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dep_name })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                closeAddDepartmentForm();
                showDepartments();
            } else {
                alert(`부서 추가 실패: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('부서 추가 요청 실패:', error);
        });
    }

    function showAddDepartmentForm() {
        const form = document.getElementById('add-department-form');
        if (form) form.style.display = 'block';
    }

    function closeAddDepartmentForm() {
        const form = document.getElementById('add-department-form');
        if (form) form.style.display = 'none';
    }

    document.getElementById('submit-department-button').addEventListener('click', () => {
        const depNameInput = document.getElementById('new-department-name');
        const depName = depNameInput.value.trim();
        if (depName) {
            addDepartment(depName);
            depNameInput.value = '';
        } else {
            alert('부서 이름을 입력해 주세요.');
        }
    });

    document.querySelector('#cancel-department-button').addEventListener('click', closeAddDepartmentForm);

    function loadUsersByDepartment(department) {
        const query = department.toLowerCase();
        const userContainer = document.querySelector('#user-container>main');
        const userCards = userContainer.querySelectorAll('.user-card');
        const noResultsMessage = userContainer.querySelector('.no-results-message');

        let anyVisible = false;

        userCards.forEach(card => {
            const nameElement = card.querySelector('.dep-show');
            if (nameElement) {
                const name = nameElement.textContent.toLowerCase();
                if (name === query) {
                    card.style.display = 'flex';
                    anyVisible = true;
                } else {
                    card.style.display = 'none';
                }
            } else {
                card.style.display = 'none';
            }
        });

        noResultsMessage.style.display = anyVisible ? 'none' : 'block';
        autoScrollTop();
    }

    function searchUsers() {
        const query = document.getElementById('search-input').value.toLowerCase();
        const userContainer = document.querySelector('#user-container>main');
        const userCards = userContainer.querySelectorAll('.user-card');
        const noResultsMessage = userContainer.querySelector('.no-results-message');

        let anyVisible = false;

        userCards.forEach(card => {
            const nameElement = card.querySelector('.user-info p strong');
            if (nameElement) {
                const name = nameElement.textContent.toLowerCase();
                if (name.includes(query)) {
                    card.style.display = 'flex';
                    anyVisible = true;
                } else {
                    card.style.display = 'none';
                }
            } else {
                card.style.display = 'none';
            }
        });

        noResultsMessage.style.display = anyVisible ? 'none' : 'block';
        autoScrollTop();
    }

    function deleteDepartment(dep_id) {
        fetch('/delete-department', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dep_id })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showDepartments();
            } else {
                alert(`부서 삭제 실패: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('부서 삭제 요청 실패:', error);
        });
    }

    function autoScrollTop() {
        const section = document.querySelector('.user-container>main');
        section.scrollTo(0, 0);
    }

    const editUserButtons = document.querySelectorAll('.edit-button');
    editUserButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            const cards = button.parentNode;
            const user_id = button.getAttribute('data-user-id');
            const jobShow = cards.querySelector('.job-show');
            const jobInput = cards.querySelector('.job-input');
            const depShow = cards.querySelector('.dep-show');
            const depInput = cards.querySelector('.dep-input');

            if (button.getAttribute('role') == 'edit') {
                jobShow.style.display = 'none';
                jobInput.style.display = 'inline-block';
                depShow.style.display = 'none';
                depInput.style.display = 'inline-block';

                const response = await fetch('/departmentList');
                const depList = await response.json();

                depInput.innerHTML = '';

                depList.departments.forEach((dep) => {
                    const option = document.createElement('option');
                    option.setAttribute('value', dep.dep_name);
                    if (depShow.innerText == dep.dep_name) {
                        option.setAttribute('selected', '');
                    }
                    option.innerText = dep.dep_name;
                    depInput.appendChild(option);
                });

                button.setAttribute('role', 'confirm');
                button.innerText = '확인';
            } else if (button.getAttribute('role') == 'confirm') {
                jobShow.innerText = jobInput.value;
                depShow.innerText = depInput.value;

                try {
                    const result = await fetch(
                        '/updateUser/'+user_id, 
                        {
                            method: 'POST',
                            headers: {
                                "content-type": "application/json"
                            },
                            body: JSON.stringify({
                                job_id: jobInput.value,
                                dep_name: depInput.value
                            })
                        }
                    );
                } catch {
                    console.error('Error: ', error);
                }
                jobShow.style.display = 'inline-block';
                jobInput.style.display = 'none';
                depShow.style.display = 'inline-block';
                depInput.style.display = 'none';
                button.setAttribute('role', 'edit');
                button.innerText = '수정';
            }
        });
    });

    document.getElementById('search-input')?.addEventListener('input', searchUsers);
    document.getElementById('search-button')?.addEventListener('click', searchUsers);

// 사용자 정보를 수정하는 함수
function editUser(userId) {
    fetch(`/getUser/${userId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const user = data.user;
                // 수정 폼에 사용자 정보 설정
                document.getElementById('edit-user-phone').value = user.phone;
                document.getElementById('edit-user-job').value = user.job_id;
                document.getElementById('edit-user-department').value = user.dep_name;

                // 수정 폼을 보이도록 설정
                document.getElementById('edit-user-form').style.display = 'block';
            } else {
                alert(`사용자 정보 가져오기 실패: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('사용자 정보 가져오기 실패:', error);
        });
}

// 수정된 사용자 정보를 제출하는 함수
function submitUserEdit() {
    const userPhone = document.getElementById('edit-user-phone').value.trim();
    const userJob = document.getElementById('edit-user-job').value.trim();
    const userDepartment = document.getElementById('edit-user-department').value.trim();

    if (!userName || !userPhone || !userJob || !userDepartment) {
        alert('모든 필드를 입력해 주세요.');
        return;
    }

    fetch(`/updateUser/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            user_name: userName, 
            user_phone: userPhone, 
            job_id: userJob,
            dep_name: userDepartment 
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('edit-user-form').style.display = 'none';
            showUsers(); // 사용자 목록 갱신
        } else {
            alert(`사용자 수정 실패: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('사용자 수정 요청 실패:', error);
    });
}

// 수정 폼 닫기
function cancelUserEdit() {
    document.getElementById('edit-user-form').style.display = 'none';
}

// 폼 제출 버튼과 취소 버튼에 이벤트 리스너 추가
document.getElementById('submit-edit-button')?.addEventListener('click', submitUserEdit);
document.getElementById('cancel-edit-button')?.addEventListener('click', cancelUserEdit);

    // 채팅 스크롤바 업데이트
    const chatMain = document.querySelector('.user-container>main');
    chatMain.addEventListener('scroll', () => {
        const scroll = document.querySelector('.scroll');
        if (scroll) {
            scroll.style.top = `${chatMain.scrollTop / (chatMain.scrollHeight - chatMain.clientHeight) * (chatMain.scrollHeight - scroll.clientHeight)}px`;
        }
    });

    // 이미지 로딩 처리
//    const images = document.querySelectorAll('.profile-pic');
//    images.forEach(img => {
//        img.classList.add('loading');
//        img.addEventListener('load', () => img.classList.remove('loading'));
//        img.addEventListener('error', () => img.classList.remove('loading'));
//        img.src = img.dataset.src;
//    });

    // 사용자의 채팅방을 시작합니다.
    function startChat(userId) {
        window.open(`/chat?user=${userId}`, '_blank');
    }

    window.startChat = startChat;
    window.showDepartments = showDepartments;
});



