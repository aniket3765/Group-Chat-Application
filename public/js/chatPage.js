axios.defaults.headers.common['X-Auth-Token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const message = document.getElementById('messageBlock');
document.getElementById('send').addEventListener('click', addMessage);
document.getElementById('createGroup').addEventListener('click',createGroup);
const groupName = document.getElementById('groupName');
const chatBlock = document.getElementById('chatBlock');
let count = 0;
let lastMessageId = 0;
let messageArray = []

const token = localStorage.getItem('token');
if(localStorage.getItem('commonGroup') == null){
    localStorage.setItem('commonGroup','[]');
}
else{
    messageArray = JSON.parse(localStorage.getItem('commonGroup'))
   lastMessageId = messageArray[0].id;
}

async function allMessages() {

  await  axios.post('/allMessages',{ id:lastMessageId })
        .then(res => {
           res.data.forEach(msg => {
            messageArray = JSON.parse(localStorage.getItem('commonGroup'));
    let messageArrayLength = messageArray.length;
    if(messageArrayLength ==10){
        messageArray.shift();
    }
    messageArray.push(msg);
    lastMessageId = msg.id
    localStorage.setItem('commonGroup',JSON.stringify(messageArray))
           })
          
        })
}

 //setInterval(allMessages,1000);

 allMessages();

function addMessageToScreen(user, message) {

    let p = document.createElement('p');
    p.innerHTML = user + " : " + message;
    chatBlock.appendChild(p);
}

function addMessage() {
    if (message.value == "") return alert('empty message!');
    axios.post('/addMessage', { message: message.value, token: token })
        .then(res => {
            if (res.status == 200) return null
            else alert('something went wrong');
        }).catch(err => console.log(err))
    message.value = '';
}

function createGroup (){
//axios('/createGroup',{token:token, groupName:groupName.value});
console.log('me')
let p = document.createElement('p');
p.setAttribute('id',groupName.value);
p.innerHTML= groupName.value;
document.getElementById('groupBlock').appendChild(p);
}