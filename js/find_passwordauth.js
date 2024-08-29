document.addEventListener('DOMContentLoaded', () => {
    const sendVerificationCodeButton = document.getElementById('sendVerificationCode');
    const verifyCodeButton = document.getElementById('verifyCode');
    const registerButton = document.getElementById('registerButton');
    const phoneInput = document.getElementById('phone');
    const verificationCodeInput = document.getElementById('verification-code');
    const submitBtn = document.getElementById("submitBtn");

    // MoAI 로고 클릭 시 login.html로 이동
    document.querySelector('header.container').addEventListener('click', function() {
        window.location.href = 'login';
    });
    
    // 인증 상태 변수
    let isVerified = false;

    // 인증번호 전송
    function sendVerificationCode() {
        const phone = phoneInput.value;
        console.log({ phone });
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
                  isVerified = true;  // 인증 성공 시 상태 변경
                  registerButton.disabled = false;
              } else {
                  alert('인증번호가 올바르지 않습니다.');
                  isVerified = false; // 인증 실패 시 상태 초기화
              }
          });
    }

    // 인증번호 전송 버튼 클릭
    if (sendVerificationCodeButton) {
        sendVerificationCodeButton.addEventListener('click', sendVerificationCode);
    }

    // 인증번호 확인 버튼 클릭
    if (verifyCodeButton) {
        verifyCodeButton.addEventListener('click', verifyCode);
    }

    // 제출 버튼 클릭
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (isVerified) {
                // 인증이 성공했을 때만 페이지 전환
                fetch('/find_passwordauth', {
                    method: 'POST',
                    // headers: 'applicat'
                })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    // console.log(data);
                    window.location.href = data.redirectTo;
                })
                    // .then(response => response.json())
                    // .then(data => {
                    //     // console.log(data);
                    //     window.location.href = data.redirectTo;
                    // })
                    // .catch(error => {
                    //     console.error('Error fetching redirect URL:', error);
                    //     alert('리디렉션 URL을 가져오는 데 실패했습니다.');
                    // });
            } else {
                alert('인증이 완료되지 않았습니다. 인증을 완료해주세요.');
            }
        });
    }
});
