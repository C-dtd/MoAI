document.addEventListener('DOMContentLoaded', () => {
    const projectCardsContainer = document.querySelector('.content');
    const addProjectButton = document.getElementById('addProject');
    const removeProjectButton = document.getElementById('removeProject');
    const addProjectModal = document.getElementById('addProjectModal');
    const closeProjectModalButton = document.getElementById('closeProjectModal');
    const projectForm = document.getElementById('projectForm');
    const addFileButton = document.getElementById('addFile');
    const addFileModal = document.getElementById('addFileModal');
    const closeFileModalButton = document.getElementById('closeFileModal');
    const fileForm = document.getElementById('fileForm');
    const fileItems = document.getElementById('fileItems');
    const fileInput = document.getElementById('fileInput');
    const viewFileModal = document.getElementById('viewFileModal');
    const closeViewFileModalButton = document.getElementById('closeViewFileModal');
    const fileContent = document.getElementById('fileContent');

    const files = {
        1: [],
        2: [],
        3: [],
        4: []
    };

    let projectCount = 4;  // 시작 프로젝트 수
    let selectedProject = null;  // 현재 선택된 프로젝트

    function createProjectCard(projectNumber, projectName, startDate, endDate) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.project = projectNumber;
        card.innerHTML = `
            <div class="project-header">
                <div class="project-icon">${projectNumber}</div>
                <div class="project-title">${projectName}</div>
            </div>
            <div class="project-dates">${startDate} ~ ${endDate}</div>
            <div class="divider"></div>
        `;
        card.addEventListener('click', () => {
            document.querySelectorAll('.project-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedProject = projectNumber;
            displayFiles(files[projectNumber]);
        });
        return card;
    }

    function addProject() {
        addProjectModal.style.display = 'block';  // 모달 띄우기
    }

    function closeProjectModal() {
        addProjectModal.style.display = 'none';  // 모달 숨기기
    }

    function handleProjectFormSubmit(event) {
        event.preventDefault();  // 폼 제출 기본 동작 방지
        
        const projectName = document.getElementById('projectName').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        // 날짜 형식 검증
        if (new Date(startDate) > new Date(endDate)) {
            alert('종료 날짜는 시작 날짜 이후여야 합니다.');
            return;
        }

        projectCount += 1;
        const newCard = createProjectCard(projectCount, projectName, startDate, endDate);
        projectCardsContainer.appendChild(newCard);
        files[projectCount] = [];  // 빈 배열로 초기화

        closeProjectModal();  // 모달 닫기
    }

    function removeProject() {
        if (selectedProject !== null) {
            delete files[selectedProject];  // 파일 목록에서 삭제
            const cardToRemove = document.querySelector(`.project-card[data-project="${selectedProject}"]`);
            projectCardsContainer.removeChild(cardToRemove);  // 카드 삭제
            selectedProject = null;  // 선택된 프로젝트 초기화
            fileItems.innerHTML = ''; // 파일 목록도 초기화
        } else {
            alert('삭제할 프로젝트를 선택하세요.');
        }
    }

    function addFile() {
        if (selectedProject === null) {
            alert('파일을 추가할 프로젝트를 선택하세요.');
            return;
        }
        fileInput.value = ''; // 파일 입력 초기화
        addFileModal.style.display = 'block';  // 모달 띄우기
    }

    function closeFileModal() {
        addFileModal.style.display = 'none';  // 모달 숨기기
    }

    async function handleFileFormSubmit(event) {
        event.preventDefault();  // 폼 제출 기본 동작 방지

        const file = fileInput.files[0];
        if (!file) {
            alert('파일을 선택하세요.');
            return;
        }

        // const formData = new FormData();
        // formData.append('file', file);
        // const fileName = file.name;
        // const response = await fetch('/upload', {
        //     method: 'POST',
        //     body: formData
        // });
        // const res = await response.json();
        // fileInput.value = '';
        
        const fileName = file.name;
        const fileReader = new FileReader();

        fileReader.onload = function(e) {
            const fileDataURL = e.target.result;
            files[selectedProject].push({ name: fileName, dataURL: fileDataURL });
            displayFiles(files[selectedProject]);

            closeFileModal();  // 모달 닫기
        };

        fileReader.readAsDataURL(file);
    }

    function displayFiles(fileList) {
        fileItems.innerHTML = '';  // 기존 파일 목록 지우기

        if (fileList && fileList.length > 0) {
            fileList.forEach((file, index) => {
                const li = document.createElement('li');
                const fileIcon = document.createElement('div');
                fileIcon.className = `file-icon ${file.name.split('.').pop().toLowerCase()}`;
                const fileText = document.createElement('span');
                fileText.textContent = file.name;

                const viewButton = document.createElement('button');
                viewButton.textContent = 'VIEW';
                viewButton.addEventListener('click', () => {
                    displayFileContent(file);
                    viewFileModal.style.display = 'block';
                });

                const downloadButton = document.createElement('button');
                downloadButton.textContent = 'DOWNLOAD';
                downloadButton.addEventListener('click', () => {
                    const link = document.createElement('a');
                    link.href = file.dataURL;
                    link.download = file.name;
                    link.click();
                });

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'DELETE';
                deleteButton.className = 'file-delete';
                deleteButton.addEventListener('click', () => {
                    files[selectedProject].splice(index, 1);
                    displayFiles(files[selectedProject]);
                });

                const actions = document.createElement('div');
                actions.className = 'file-actions';
                actions.appendChild(viewButton);
                actions.appendChild(downloadButton);
                actions.appendChild(deleteButton);

                li.appendChild(fileIcon);
                li.appendChild(fileText);
                li.appendChild(actions);
                fileItems.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = '저장된 파일이 없습니다';
            fileItems.appendChild(li);
        }
    }

    function displayFileContent(file) {
        fileContent.innerHTML = ''; // Clear previous content

        const fileType = file.name.split('.').pop().toLowerCase();
        
        switch (fileType) {
            case 'pdf':
                fileContent.innerHTML = `<iframe src="${file.dataURL}" style="width:100%; height:80vh;" frameborder="0"></iframe>`;
                break;
            case 'hwp':
                fileContent.innerHTML = `<p>HWP 파일을 지원하지 않습니다. 파일을 다운로드하여 열어보세요.</p>`;
                break;
            case 'png':
                fileContent.innerHTML = `<img src="${file.dataURL}" style="width:100%; height:auto;" />`;
                break;
            default:
                fileContent.innerHTML = `<p>지원하지 않는 파일 형식입니다.</p>`;
                break;
        }
    }

    function closeFileViewModal() {
        viewFileModal.style.display = 'none';
    }

    // Event Listeners
    addProjectButton.addEventListener('click', addProject);
    closeProjectModalButton.addEventListener('click', closeProjectModal);
    projectForm.addEventListener('submit', handleProjectFormSubmit);

    removeProjectButton.addEventListener('click', removeProject);
    addFileButton.addEventListener('click', addFile);
    closeFileModalButton.addEventListener('click', closeFileModal);
    fileForm.addEventListener('submit', handleFileFormSubmit);

    closeViewFileModalButton.addEventListener('click', closeFileViewModal);

    // Initialize with example projects
    const exampleProjects = [
        { number: 1, name: '프로젝트명1', startDate: '2024-01-01', endDate: '2024-06-30' },
        { number: 2, name: '프로젝트명2', startDate: '2024-02-01', endDate: '2024-07-31' },
        { number: 3, name: '프로젝트명3', startDate: '2024-03-01', endDate: '2024-08-31' },
        { number: 4, name: '프로젝트명4', startDate: '2024-04-01', endDate: '2024-09-30' }
    ];

    exampleProjects.forEach(project => {
        const card = createProjectCard(project.number, project.name, project.startDate, project.endDate);
        projectCardsContainer.appendChild(card);
    });
});








