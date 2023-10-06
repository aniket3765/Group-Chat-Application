axios.defaults.headers.common['X-Auth-Token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const message = document.getElementById('messageBlock');
document.getElementById('send').addEventListener('click', addMessage);
const chatBlock = document.getElementById('chatBlock');
let count = 0;
let lastMessageId = 0;
let messageArray = []

const token = localStorage.getItem('token');
if(localStorage.getItem('messages') == null){
    localStorage.setItem('messages','[]');
}
else{
    messageArray = JSON.parse(localStorage.getItem('messages'))
   lastMessageId = messageArray[0].id;
}

async function allMessages() {

  await  axios.post('/allMessages',{ id:lastMessageId})
        .then(res => {
           res.data.forEach(msg => {
            messageArray = JSON.parse(localStorage.getItem('messages'));
    let messageArrayLength = messageArray.length;
    if(messageArrayLength ==10){
        messageArray.shift();
    }
    messageArray.push(msg);
    lastMessageId = msg.id
    localStorage.setItem('messages',JSON.stringify(messageArray))
           })
          
        })
}

 setInterval(allMessages,1000);

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