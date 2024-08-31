document.addEventListener('DOMContentLoaded', () => {
    const sendVerificationCodeButton = document.getElementById('sendVerificationCode');
    const verifyCodeButton = document.getElementById('verifyCode');
    const registerButton = document.getElementById('registerButton');
    const phoneInput = document.getElementById('phone');
    const verificationCodeInput = document.getElementById('verification-code');
    const checkDuplicateIdButton = document.getElementById('checkDuplicateIdCode');
    const userIdInput = document.getElementById('userId');
    const duplicateCheckResult = document.getElementById('duplicateCheckResult');
    
    let isIdValid = false;
    let isPhoneVerified = false;

    // MoAI 로고 클릭 시 login.ejs 이동
    document.querySelector('header.container').addEventListener('click', function() {
        window.location.href = 'login';
    });

    function updateRegisterButtonState() {
        if (isIdValid && isPhoneVerified) {
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

    updateRegisterButtonState();
});
