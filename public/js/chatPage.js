axios.defaults.headers.common['X-Auth-Token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const message = document.getElementById('messageBlock');
document.getElementById('send').addEventListener('click',addMessage);

const token = localStorage.getItem('token');

function addMessageToScreen (message){
    let p = document.createElement('p');
    p.innerHTML = message;
    document.getElementById('chatBlock').appendChild(p);
}

function addMessage(){
    if(message.value == "") return alert('empty message!');
    axios.post('/addMessage',{message:message.value, token:token})
    .then(res=> {
        if(res.status == 200) addMessageToScreen(message.value);
        else alert('something went wrong');
    }).catch(err => console.log(err))
}