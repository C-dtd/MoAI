document.addEventListener('DOMContentLoaded', () => {
    const isAdmin = document.body.dataset.admin === 'true';

    showDepartments();

    // 부서 목록을 표시합니다.
    function showDepartments() {
        const container = document.getElementById('departments-container');
        container.innerHTML = ''; // 부서 목록 초기화

        fetch('/departmentList')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json(); // JSON 응답을 받도록 처리
            })
            .then(data => {
                console.log('Data received:', data); // 데이터 확인
                const departments = data.departments; // JSON 데이터에서 부서 목록 추출

                if (!Array.isArray(departments) || departments.length === 0) {
                    container.innerHTML = '<p>부서 데이터가 없습니다.</p>';
                    return;
                }

                departments.forEach(department => {
                    const departmentItem = document.createElement('article');
                    departmentItem.className = 'department-item';
                    departmentItem.dataset.id = department.dep_id; // dep_id를 데이터 속성으로 설정
                    departmentItem.textContent = department.dep_name; // dep_name을 텍스트로 설정
                    departmentItem.onclick = () => loadUsersByDepartment(department.dep_name);

                    if (isAdmin) {
                        const deleteButton = document.createElement('button');
                        deleteButton.className = 'delete-department-button';
                        deleteButton.textContent = '삭제';
                        deleteButton.onclick = (event) => {
                            event.stopPropagation(); // 클릭 이벤트가 부모 요소에 전달되지 않도록 함
                            deleteDepartment(department.dep_id); // dep_id를 사용하여 삭제
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

    // 부서를 추가하는 함수
    function addDepartment(dep_name) {
        fetch('/add-department', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dep_name }) // dep_name을 JSON으로 변환하여 전송
        })
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data); // 데이터 확인
            if (data.success) {
                // 성공적으로 추가된 경우, 부서 목록을 다시 로드합니다.
                closeAddDepartmentForm(); // 모달 닫기
                showDepartments();
            } else {
                alert(`부서 추가 실패: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('부서 추가 요청 실패:', error);
        });
    }

    // 부서 추가 폼을 표시하는 함수
    function showAddDepartmentForm() {
        const form = document.getElementById('add-department-form');
        if (form) {
            form.style.display = 'block'; // 폼을 보이도록 설정
        }
    }

    // 부서 추가 폼을 닫는 함수
    function closeAddDepartmentForm() {
        const form = document.getElementById('add-department-form');
        if (form) {
            form.style.display = 'none'; // 폼을 숨기도록 설정
        }
    }

    // 부서 추가 폼 제출 시
    document.getElementById('submit-department-button').addEventListener('click', () => {
        const depNameInput = document.getElementById('new-department-name');
        const depName = depNameInput.value.trim();
        if (depName) {
            addDepartment(depName);
            depNameInput.value = ''; // 입력 필드 초기화
        } else {
            alert('부서 이름을 입력해 주세요.');
        }
    });
    document.querySelector('#cancel-department-button').addEventListener('click', closeAddDepartmentForm);

    // 부서별 유저 검색
    function loadUsersByDepartment(department) {
        const query = department.toLowerCase();
        const userContainer = document.querySelector('#user-container>main');
        const userCards = userContainer.querySelectorAll('.user-card');
        const noResultsMessage = userContainer.querySelector('.no-results-message');

        let anyVisible = false;

        userCards.forEach(card => {
            const nameElement = card.querySelector('.user-info p .dep');
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
    }

    // 사용자 검색 기능
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
    }

    // 부서를 삭제하는 함수
    function deleteDepartment(dep_id) {
        fetch('/delete-department', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dep_id }) // dep_id를 JSON으로 변환하여 전송
        })
        .then(response => response.json())
        .then(data => {
            console.log('Data received:', data); // 데이터 확인
            if (data.success) {
                // 성공적으로 삭제된 경우, 부서 목록을 다시 로드합니다.
                showDepartments();
            } else {
                alert(`부서 삭제 실패: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('부서 삭제 요청 실패:', error);
        });
    }

    // 검색 입력 필드에서 input 이벤트를 사용할 때 검색 실행
    document.getElementById('search-input')?.addEventListener('input', searchUsers);

    // 검색 버튼 클릭 시 검색 실행
    document.getElementById('search-button')?.addEventListener('click', searchUsers);

    document.addEventListener('DOMContentLoaded', () => {
        // 사용자 정보를 수정하는 함수
        function editUser(userId) {
            fetch(`/getUser/${userId}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const user = data.user;
                        // 수정 폼에 사용자 정보 설정
                        document.getElementById('edit-user-id').value = user.user_id; // Ensure this matches the field in the response
                        document.getElementById('edit-user-name').value = user.user_name;
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
            const userId = document.getElementById('edit-user-id').value;
            const userName = document.getElementById('edit-user-name').value.trim();
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
                    phone: userPhone, 
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

    });
    






    // 채팅 스크롤바 업데이트
    const chatMain = document.querySelector('.user-container>main');
    chatMain.addEventListener('scroll', () => {
        const scroll = document.querySelector('.scroll');
        if (scroll) {
            scroll.style.top = `${chatMain.scrollTop / (chatMain.scrollHeight - chatMain.clientHeight) * (chatMain.scrollHeight - scroll.clientHeight)}px`;
        }
    });

    // 이미지 로딩 처리
    const images = document.querySelectorAll('.profile-pic');
    images.forEach(img => {
        img.classList.add('loading');
        img.addEventListener('load', () => img.classList.remove('loading'));
        img.addEventListener('error', () => img.classList.remove('loading'));
        img.src = img.dataset.src;
    });

    // 사용자의 채팅방을 시작합니다.
    function startChat(userId) {
        window.open(`/chat?user=${userId}`, '_blank');
    }

    // export functions if needed
    window.startChat = startChat;
    window.showDepartments = showDepartments; // Only if needed for other JS files
});




