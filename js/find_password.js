document.addEventListener("DOMContentLoaded", function () {
    // Get references to the input field and button
    const usernameInput = document.getElementById("username");
    const nextButton = document.querySelector("button");

    // Add a click event listener to the button
    nextButton.addEventListener("click", function () {
        const username = usernameInput.value.trim();

        if (username === "") {
            alert("아이디를 입력해주세요.");  // Alert if the input is empty
        } else {
            // Simulate an action, like sending a request to find the password
            alert(`아이디: ${username}의 비밀번호를 찾기 위한 요청이 전송되었습니다.`);
            
            // Example: Redirect to a different page (optional)
            // window.location.href = "/password-reset-link-sent"; 
        }
    });
});
