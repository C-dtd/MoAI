document.addEventListener('DOMContentLoaded', () => {
    const sendVerificationCodeButton = document.getElementById('sendVerificationCode');
    const verifyCodeButton = document.getElementById('verifyCode');
    const registerButton = document.getElementById('registerButton');
    const phoneInput = document.getElementById('phone');
    const verificationCodeInput = document.getElementById('verification-code');
    const checkDuplicateIdButton = document.getElementById('checkDuplicateIdCode');
    const userIdInput = document.getElementById('userId');
    const duplicateCheckResult = document.getElementById('duplicateCheckResult');
    const nameInput = document.getElementById('name');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordStatus = document.getElementById('password-status');
    const confirmPasswordStatus = document.getElementById('confirm-password-status');
    const moaiTitle = document.getElementById('moai-title');

    let isIdValid = false;
    let isPhoneVerified = false;

    // MoAI 클릭 시 로그인 페이지로 이동
    moaiTitle.addEventListener('click', function() {
        window.location.href = '/login';
    });

    // 비밀번호를 영어+숫자 포함 8글자 이상으로 제한
    function validatePassword(password) {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return regex.test(password);
    }

    // 비밀번호 입력 상태 표시
    function updatePasswordStatus() {
        const password = passwordInput.value.trim();

        if (password === "") {
            passwordStatus.textContent = "";
        } else if (validatePassword(password)) {
            passwordStatus.textContent = "사용 가능한 비밀번호입니다.";
            passwordStatus.style.color = "green";
        } else {
            passwordStatus.textContent = "비밀번호는 영문과 숫자를 포함하여 8자 이상이어야 합니다.";
            passwordStatus.style.color = "red";
        }
    }

    // 비밀번호 확인란 입력 상태 표시
    function updateConfirmPasswordStatus() {
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (confirmPassword === "") {
            confirmPasswordStatus.textContent = ""; // 아무것도 입력하지 않았을 때는 상태를 표시하지 않음
        } else if (password === confirmPassword) {
            confirmPasswordStatus.textContent = "비밀번호가 일치합니다.";
            confirmPasswordStatus.style.color = "green";
        } else {
            confirmPasswordStatus.textContent = "비밀번호가 일치하지 않습니다.";
            confirmPasswordStatus.style.color = "red";
        }
    }
    
    // 회원가입 전 유효성 검사
    function updateRegisterButtonState() {
        const isNameValid = nameInput.value.trim() !== ""; 
        const isPasswordValid = validatePassword(passwordInput.value.trim()); 
        const doPasswordsMatch = passwordInput.value === confirmPasswordInput.value; 

        if (isIdValid && isPhoneVerified && isNameValid && isPasswordValid && doPasswordsMatch) {
            registerButton.disabled = false;
        } else {
            registerButton.disabled = true;
        }
    }

    function checkDuplicateIdCode() {
        const userId = userIdInput.value.trim();

        if (userId === "") {
            duplicateCheckResult.textContent = "아이디를 입력해주세요.";
            duplicateCheckResult.style.display = 'block';
            duplicateCheckResult.style.color = 'red';
            isIdValid = false;
            updateRegisterButtonState();
            return;
        }

        fetch('/check-duplicate-id', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.isDuplicate) {
                duplicateCheckResult.textContent = "이미 사용 중인 아이디입니다.";
                duplicateCheckResult.style.color = 'red';
                isIdValid = false;
            } else {
                duplicateCheckResult.textContent = "사용 가능한 아이디입니다.";
                duplicateCheckResult.style.color = 'green';
                isIdValid = true;
            }
            duplicateCheckResult.style.display = 'block';
            updateRegisterButtonState();
        })
        .catch(error => {
            console.error('Error:', error);
            duplicateCheckResult.textContent = "아이디 중복 확인 중 오류가 발생했습니다.";
            duplicateCheckResult.style.color = 'red';
            duplicateCheckResult.style.display = 'block';
            isIdValid = false;
            updateRegisterButtonState();
        });
    }

    // 인증번호 전송
    function sendVerificationCode() {
        const phone = phoneInput.value;
        console.log({phone})
        fetch('/send-verification-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  alert('인증번호가 발송되었습니다.');
              } else {
                  alert('인증번호 발송에 실패했습니다.');
              }
          });
    }

    // 인증번호 확인
    function verifyCode() {
        const phone = phoneInput.value.trim();
        const code = verificationCodeInput.value.trim();

        fetch('/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code })
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  alert('인증이 완료되었습니다.');
                  isPhoneVerified = true;
              } else {
                  alert('인증번호가 올바르지 않습니다.');
                  isPhoneVerified = false;
              }
              updateRegisterButtonState();
          })
          .catch(error => {
              console.error('Error:', error);
              isPhoneVerified = false;
              updateRegisterButtonState();
          });
    }

    if (checkDuplicateIdButton) {
        checkDuplicateIdButton.addEventListener('click', checkDuplicateIdCode)
    }

    if (sendVerificationCodeButton) {
        sendVerificationCodeButton.addEventListener('click', sendVerificationCode);
    }

    if (verifyCodeButton) {
        verifyCodeButton.addEventListener('click', verifyCode);
    }

    nameInput.addEventListener('input', updateRegisterButtonState); // 이름 입력 이벤트 리스너 추가
    passwordInput.addEventListener('input', () => {
        updatePasswordStatus();
        updateConfirmPasswordStatus(); // 비밀번호 확인 상태도 같이 업데이트
        updateRegisterButtonState();
    }); 
    confirmPasswordInput.addEventListener('input', () => {
        updateConfirmPasswordStatus();
        updateRegisterButtonState();
    });
    updateRegisterButtonState();
});
