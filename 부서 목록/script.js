/**
 * 주어진 부서 ID에 해당하는 사원 목록을 표시합니다.
 * @param {string} departmentId - 표시할 부서의 ID
 */
function showEmployees(departmentId) {
    // 모든 부서의 사원 목록을 숨깁니다.
    const allEmployeeLists = document.querySelectorAll('.employee-list');
    allEmployeeLists.forEach(list => list.style.display = 'none');

    // 선택한 부서의 사원 목록을 표시합니다.
    const selectedEmployeeList = document.getElementById(departmentId);
    if (selectedEmployeeList) {
        selectedEmployeeList.style.display = 'flex'; // flex로 설정하여 카드들이 정렬되도록 합니다.
    }
}

// 이미지가 로드되기 전에는 회색 배경을 표시합니다.
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.profile-pic');
    
    images.forEach(img => {
        // 이미지가 로딩 중일 때 회색 배경 추가
        img.classList.add('loading');
        
        // 이미지가 로드되면 회색 배경을 제거하고 실제 이미지로 변경
        img.addEventListener('load', () => {
            img.classList.remove('loading');
        });

        // 이미지 로딩 실패 시에도 회색 배경 유지
        img.addEventListener('error', () => {
            img.classList.remove('loading');
        });

        // 실제 이미지 소스를 설정
        img.src = img.dataset.src;
    });
});











