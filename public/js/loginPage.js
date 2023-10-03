axios.defaults.headers.common['X-Auth-Token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const name = document.getElementById('name');
const email = document.getElementById('email');
const phoneNumber = document.getElementById('phoneNumber');
const password = document.getElementById('password');

document.getElementById('loginButton').addEventListener('click',login)

localStorage.clear();

function login(){
    if (name.value=="" || password.value=="") return alert("Enter details");
    axios.post('/login',{name:name.value, password:password.value})
    .then(res =>{
      localStorage.setItem('token',res.data.token);
      window.location.href = `window`; 
}).catch(res =>{
    if(res.response.status == 404) return alert('Incorrect Username');
       else if(res.response.status == 401) return alert('Incorrect password');
})
}