document.addEventListener("DOMContentLoaded", function () {
    const userIdInput = document.getElementById("user_id");
    const submitBtn = document.getElementById("submitBtn");
    const moaiTitle = document.getElementById('moai-title');
    const alertDiv = document.querySelector('.alert');

    // MoAI 클릭 시 로그인 페이지로 이동
    moaiTitle.addEventListener('click', function() {
        window.location.href = '/login';
    });

    submitBtn.addEventListener("click", function () {
        const userId = userIdInput.value.trim();

        if (userId === "") {
            alertDiv.innerText = 'ID를 입력해주세요';
            // alert("User ID is required");
            return;
        }

        fetch('/find_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: userId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                // 서버에서 리디렉션 URL을 제공했으므로 페이지 이동
                window.location.href = data.redirectTo;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alertDiv.innerText = '서버에 문제가 발생했습니다.';
            alert('Internal server error');
        });
    });
});
