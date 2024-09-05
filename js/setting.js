document.getElementById('logout-button').addEventListener('click', async () => {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            window.top.location.href = '/login'; // 로그아웃 후 로그인 페이지로 리다이렉트
        } else {
            alert('로그아웃 중 문제가 발생했습니다.');
        }
    } catch (error) {
        console.error('로그아웃 오류:', error);
        alert('로그아웃 중 문제가 발생했습니다.');
    }
});
const form = document.getElementById('setting-form');

document.addEventListener('DOMContentLoaded', () => {
    // 이미지 파일 업로드 버튼 클릭 시 파일 선택
    document.getElementById("change-button").addEventListener('click', () => {
        document.getElementById("file-input").click();
    });

    // 파일 선택 후 업로드
    document.getElementById("file-input").addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profileImage", file);

        try {
            const response = await fetch('/upload-profile-image', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                const imageUrl = data.imageUrl;
                // 이미지 업데이트
                const userAvatar = document.querySelector('.user-avatar');
                if (userAvatar) {
                    userAvatar.src = imageUrl;
                } else {
                    console.error("User avatar element not found.");
                }
                parent.userProfileUpdate(imageUrl);
            } else {
                alert(`사진 업로드 중 문제가 발생했습니다. 상태 코드: ${response.status}`);
            }
        } catch (error) {
            console.error("업로드 오류", error);
            alert("사진 업로드 중 문제가 발생했습니다.");
        }
    });

    const userAvatar = document.querySelector('.user-avatar');
    if (imageUrl && userAvatar) {
        userAvatar.src = imageUrl;
    }
});