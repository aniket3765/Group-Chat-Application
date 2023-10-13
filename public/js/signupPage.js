axios.defaults.headers.common['X-Auth-Token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const name = document.getElementById('name');
const email = document.getElementById('email');
const phoneNumber = document.getElementById('phoneNumber');
const password = document.getElementById('password');

document.getElementById('signupButton').addEventListener('click', createUser);

function createUser() {
    if (name.value == '' || email.value == "" || phoneNumber.value == "" || password.value == "") return alert("Enter details")
    axios.post('/creatUser', { name: name.value, email: email.value, phoneNumber: phoneNumber.value, password: password.value })
        .then(res => {
            if (res.status == 201) window.location = window.location.origin;
            alert('user created')
        }).catch(res => alert(res.response.data.message))
}
