document.addEventListener('DOMContentLoaded', () => {
    const sendVerificationCodeButton = document.getElementById('sendVerificationCode');
    const verifyCodeButton = document.getElementById('verifyCode');
    const registerButton = document.getElementById('registerButton');
    const phoneInput = document.getElementById('phone');
    const verificationCodeInput = document.getElementById('verification-code');

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
        const phone = phoneInput.value;
        const code = verificationCodeInput.value;
        fetch('/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code })
        }).then(response => response.json())
          .then(data => {
              if (data.success) {
                  alert('인증이 완료되었습니다.');
                  registerButton.disabled = false;
              } else {
                  alert('인증번호가 올바르지 않습니다.');
              }
          });
    }

    if (sendVerificationCodeButton) {
        sendVerificationCodeButton.addEventListener('click', sendVerificationCode);
    }

    if (verifyCodeButton) {
        verifyCodeButton.addEventListener('click', verifyCode);
    }
});
