const paymentReqList = document.querySelector('.payment-req-list');
const paymentResList = document.querySelector('.payment-res-list');
const fileInput = document.querySelector('#payment-input');
const paymentTitle = document.querySelector('#payment-title');
const paymentButton = document.querySelector('#payment-request');
const applier = document.querySelector('#applier');

document.querySelector('.upload-button').addEventListener('click', () => {
    fileInput.click();
});

async function get_user_id() {
    const response = await fetch('/session/user_id');
    const res = await response.text();
    return res;
}

function payment_article(payment) {
    const article = document.createElement('article');
    const header = document.createElement('header');
    header.innerText = payment.p_title;
    article.appendChild(header);
    const main = document.createElement('main');
    main.innerText = `발신자: ${payment.p_uploader}
    발신일: ${payment.created_at.split('T')[0]}
    승인자: ${payment.p_app}
    ${(payment.app_at) ? `승인일: ${payment.app_at.split('T')[0]}` : '승인일: '}`
    article.appendChild(main);
    article.addEventListener('click', () => {
        window.open('/payment/' +payment.p_id);
    });
    return article;
}

async function get_payment_req_list() {
    const response = await fetch('/payment/request');
    const res = await response.json();
    paymentReqList.innerHTML = '';
    res.forEach((payment) => {
        paymentReqList.appendChild(payment_article(payment));
    });
}

async function get_payment_res_list() {
    const response = await fetch('/payment/response');
    const res = await response.json();
    paymentResList.innerHTML = '';
    res.forEach((payment) => {
        paymentResList.appendChild(payment_article(payment));
    });
}

fileInput.addEventListener('input', async () => {
    const file = fileInput.files[0];
    // if (file) {
    //     console.log('uploaded');
    // } else {
    //     console.log('cancled');
    // }

    paymentTitle.value = '';
    paymentTitle.setAttribute('placeholder', file.name);
});

paymentButton.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!['pdf', 'png'].includes(file.name.split('.').pop())) {
        fileInput.value = '';
        return false;
    }
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    const res = await response.json();
    fileInput.value = '';
    paymentTitle.setAttribute('placeholder', '');

    const responsePayment = await fetch('/payment_req', {
        method: 'POST',
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            path: res.path,
            app: applier.value,
            title: (paymentTitle.value) ? paymentTitle.value : file.name
        })
    });

    const resPayment =  await responsePayment.json();
    // console.log(resPayment);
    get_payment_req_list();
    get_payment_res_list();
});

get_payment_req_list();
get_payment_res_list();