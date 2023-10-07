axios.defaults.headers.common['X-Auth-Token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const message = document.getElementById('messageBlock');
document.getElementById('send').addEventListener('click', addMessage);
document.getElementById('newGroup').addEventListener('click', addUsers);
document.getElementById('createGroup').addEventListener('click', createGroup)
const groupName = document.getElementById('groupName');
const chatBlock = document.getElementById('chatBlock');
let currentGroupName = localStorage.getItem('currentGroupName');
document.getElementById('close').addEventListener('click', () => { document.getElementById("userBlock").style.display = 'none' });
document.getElementById('logout').addEventListener('click', () => { window.location = window.location.origin })
document.getElementById('groups').addEventListener('click', swicthGroup);
document.getElementById('users').addEventListener('click', addUserToGroup);
const token = localStorage.getItem('token');


async function allMessages(group) {
    let messageArray = [];
    let lastMessageId = 0;
    let messageArrayLength = 0;
    if (localStorage.getItem(group) == null || JSON.parse(localStorage.getItem(group)).length == 0) {
        localStorage.setItem(group, '[]');
    }
    else {
        messageArray = JSON.parse(localStorage.getItem(group))
        console.log(messageArray)
        lastMessageId = messageArray[messageArray.length - 1].id;
    }
    await axios.post('/allMessages', { id: lastMessageId, groupName: group, token: token })
        .then(res => {
            res.data.forEach(msg => {
                messageArray = JSON.parse(localStorage.getItem(group));
                messageArrayLength = messageArray.length;
                if (messageArrayLength == 10) {
                    messageArray.shift();
                }
                messageArray.push(msg);
                lastMessageId = msg.id
                localStorage.setItem(group, JSON.stringify(messageArray));
            })
            document.getElementById('chat').innerHTML = '';
            JSON.parse(localStorage.getItem(group)).forEach(msg => addElements('chat', `${msg.userName}: ${msg.message}`))
        })
}

//setInterval(allMessages,1000);

allMessages(currentGroupName);

function addMessageToScreen(user, message) {

    let p = document.createElement('p');
    p.innerHTML = user + " : " + message;
    chatBlock.appendChild(p);
}

function addElements(parent, data) {
    let li = document.createElement('input');
    li.setAttribute('type', 'submit');
    li.setAttribute('value', data);
    document.getElementById(parent).appendChild(li);
}

function addMessage() {
    if (message.value == "") return alert('empty message!');
    axios.post('/addMessage', { groupName: currentGroupName, message: message.value, token: token })
        .then(res => {
            if (res.status == 200) return null
            else alert('something went wrong');
        }).catch(err => console.log(err))
    message.value = '';
}

function createGroup() {
    axios.post('/createGroup', { token: token, groupName: groupName.value });
    addElements('groups', groupName.value);
    document.getElementById("userBlock").style.display = 'none'
}

function swicthGroup(e) {
    currentGroupName = e.target.value;
    localStorage.setItem('currentGroupName', e.target.value);
    allMessages(currentGroupName);
}


function addUsers() {
    document.getElementById("userBlock").style.display = 'block';
    axios.get('/allUsers').then(res => {
        res.data.forEach(e => addElements('users', e.Name));
    })
}

function allGroups() {
    axios.post('/allGroups', { token: token })
        .then(res => res.data.forEach(e => addElements('groups', e.groupName)))
}

allGroups();

function addUserToGroup(e) {
    axios.post('/addUserToGroup', { token: token, userName: e.target.value, groupName: currentGroupName });
}