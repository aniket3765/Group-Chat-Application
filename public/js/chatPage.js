axios.defaults.headers.common['X-Auth-Token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const message = document.getElementById('messageBlock');
document.getElementById('send').addEventListener('click', addMessage);
document.getElementById('newGroup').addEventListener('click', ()=>{document.getElementById("userBlock").style.display = 'block'});
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
  let  li = document.createElement('input');
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
    console.log(currentGroupName !== 'CommonGroup')
    if(currentGroupName !== 'CommonGroup'){
        document.getElementById('userEdit').innerHTML = ''
        const addUserButton = document.createElement('input');
        addUserButton.setAttribute('id','addUserButton');
        addUserButton.setAttribute('type','button');
        addUserButton.setAttribute('value','Add User')
        const removeUserButton = document.createElement('input');
        removeUserButton.setAttribute('id','removeUserButton');
        removeUserButton.setAttribute('type','button');
        removeUserButton.setAttribute('value','Remove User')
        document.getElementById('userEdit').appendChild(addUserButton);
        document.getElementById('userEdit').appendChild(removeUserButton);
        document.getElementById('addUserButton').addEventListener('click',allUsers);
        document.getElementById('removeUserButton').addEventListener('click',allGroupUsers);
    }
    else document.getElementById('userEdit').innerHTML = '';
}


function allGroupUsers() {
    
    document.getElementById("groups").innerHTML = ''
        axios.post('/allGroupUsers',{token:token, groupName:currentGroupName})
       .then(res => res.data.forEach(e => {  
       addElements('groupUsers',e.userName);
    }));
        document.getElementById("groupUsers").style.display = 'block'
        document.getElementById("groupUsers").addEventListener('click',removeUser)

}

function allUsers() {
    
    axios.get('/allUsers').then(res => {
        res.data.forEach(e => addElements('users', e.Name));
        document.getElementById("userBlock").style.display = 'block'
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

function removeUser(e) {
    axios.post('/removeUser',{token:token, groupName:currentGroupName, userName:e.target.value})
}