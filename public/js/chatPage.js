axios.defaults.headers.common['X-Auth-Token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const message = document.getElementById('messageBlock');
document.getElementById('send').addEventListener('click',addMessage);
const chatBlock = document.getElementById('chatBlock');
let count = 0;

const token = localStorage.getItem('token');

function allMessages (){
    
    axios.get('/allMessages')
    .then(res => { 
        if(count <res.data.length)
       { 
        count = res.data.length;
        chatBlock.innerHTML = ''
       res.data.forEach(e => addMessageToScreen(e.userName,e.message));}
       else return
    })
}

 setInterval(allMessages,1000);


function addMessageToScreen (user,message){
    let p = document.createElement('p');
    p.innerHTML = user+" : "+message;
    chatBlock.appendChild(p);
}

function addMessage(){
    if(message.value == "") return alert('empty message!');
    axios.post('/addMessage',{message:message.value, token:token})
    .then(res=> {
        if(res.status == 200) return null
        else alert('something went wrong');
    }).catch(err => console.log(err))
    message.value = '';
}