import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
axios.defaults.headers.common['X-Auth-Token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';


const message = document.getElementById('messageBlock');
const groupUsers = document.getElementById("groupUsers");
const userBlock = document.getElementById("userBlock");
const chat =   document.getElementById("chat");
document.getElementById('send').addEventListener('click', addMessage);
document.getElementById('newGroup')
.addEventListener('click', () =>
 { userBlock.style.display = 'block';
groupUsers.style.display = 'none'
 });
 
document.getElementById('createGroup').addEventListener('click', createGroup)
const groupName = document.getElementById('groupName');
const groups = document.getElementById('groups');
document.getElementById('groupList').addEventListener('click',()=>{
    groups.style.display = 'block'
    userBlock.style.display = 'none';
groupUsers.style.display = 'none'
})
let currentGroupId = localStorage.getItem('currentGroupId');
document.getElementById('close').addEventListener('click', () => { userBlock.style.display = 'none'; groups.style.display = 'block' });
document.getElementById('logout').addEventListener('click', () => { window.location = window.location.origin })
groups.addEventListener('click', e => swicthGroup(e.target.id));
document.getElementById('users').addEventListener('click', addUserToGroup);

const token = localStorage.getItem('token');
const socket = io('http://localhost:3000');

socket.on('receiveMessage', data => {
   addElements('chat',data.user+' : '+data.message, data.message)
})

async function allMessages(group) {
    // let messageArray = [];
    // let lastMessageId = 0;
    // let messageArrayLength = 0;
    // if (localStorage.getItem(group) == null || JSON.parse(localStorage.getItem(group)).length == 0) {
    //     localStorage.setItem(group, '[]');
    // }
    // else {
    //     messageArray = JSON.parse(localStorage.getItem(group))
    //     console.log(messageArray)
    //     lastMessageId = messageArray[messageArray.length - 1].id;
    // }
    await axios.post('/allMessages', { id: lastMessageId, groupId: group, token: token })
        .then(res => {
            document.getElementById('chat').innerHTML = ''; 
            res.data[0].messages.forEach(msg => {
                // messageArray = JSON.parse(localStorage.getItem(group));
                // messageArrayLength = messageArray.length;
                // if (messageArrayLength == 10) {
                //     messageArray.shift();
                // }
                // messageArray.push(msg);
                // lastMessageId = msg.id
                // localStorage.setItem(group, JSON.stringify(messageArray));
                console.log(msg)
            })
            
            //JSON.parse(localStorage.getItem(group)).forEach(msg => addElements('chat', `${msg.userName}: ${msg.message}`, msg.id))
        })
}

//setInterval(allMessages,1000);

//allMessages(currentGroupId);

function addElements(parent, data, id) {
    id = String(id)
    if(parent == 'chat') {
         if(id.includes('http')) {
            let a = document.createElement('a')
            a.innerHTML = data
            a.setAttribute('href',id)
            document.getElementById(parent).appendChild(a);
            document.getElementById(parent).appendChild(document.createElement('br'));
            chat.scrollTop = chat.scrollHeight- chat.clientHeight;
        }
        else{
        let p = document.createElement('p')
        p.innerHTML = data
        document.getElementById(parent).appendChild(p);
        chat.scrollTop = chat.scrollHeight- chat.clientHeight;
    }
    document.getElementById(parent).appendChild(document.createElement('hr'));
    }
   
else    {    
    let li = document.createElement('input');
    li.setAttribute('type', 'submit');
    li.setAttribute('id',id);  
    li.setAttribute('value', data);
    document.getElementById(parent).appendChild(li);
}


}

async function addMessage() {
    if (message.value == "") return alert('empty message!');
    await axios.post('/addMessage', { groupId: currentGroupId, message: message.value, token: token })
        .then(res => {
            if (res.status == 201) return null
            else alert('something went wrong');
        }).catch(err => console.log(err))
    socket.emit('sendMessage', {user: localStorage.getItem('user'),message:message.value});
    message.value = '';
}

function createGroup() {
    axios.post('/createGroup', { token: token, groupName: groupName.value })
    .then(res => console.log( groupName.value+' '+ res.data.groupId));
    
    userBlock.style.display = 'none'
}

function swicthGroup(e) {
    currentGroupId = e;
    localStorage.setItem('currentGroupId', e);
    groupUsers.innerHTML = ''
    axios.post('/allGroupUsers', { token: token, groupId: currentGroupId })
        .then(res => {
            res.data[0].users.forEach(e => {
            addElements('groupUsers', e.Name, e.id);
        });
        chat.innerHTML = ''
        res.data[0].messages.reverse().forEach(e => {
            
            addElements('chat', e.user.Name+" : "+e.message, e.message);
        })
    });


    if (currentGroupId !== '1') {
        document.getElementById('userEdit').innerHTML = ''
        const addUserButton = document.createElement('input');
        addUserButton.setAttribute('id', 'addUserButton');
        addUserButton.setAttribute('type', 'button');
        addUserButton.setAttribute('value', 'Add User')
        const removeUserButton = document.createElement('input');
        removeUserButton.setAttribute('id', 'removeUserButton');
        removeUserButton.setAttribute('type', 'button');
        removeUserButton.setAttribute('value', 'Remove User')
        document.getElementById('userEdit').appendChild(addUserButton);
        document.getElementById('userEdit').appendChild(removeUserButton);
        document.getElementById('addUserButton').addEventListener('click', allUsers);
        document.getElementById('removeUserButton').addEventListener('click', allGroupUsers);
    }
    else document.getElementById('userEdit').innerHTML = '';
}


function allGroupUsers() {
    groups.style.display = 'none'
    groupUsers.style.display = 'block'
    groupUsers.addEventListener('click', removeUser)

}

async function allUsers() {
    document.getElementById("users").innerHTML = '';
    await axios.post('/allUsers',{token:token, groupId:currentGroupId})
    .then(res => {
        res.data.forEach(e => addElements('users', e.Name, e.id));
    })
    groupUsers.style.display = 'none';
    userBlock.style.display = 'block';
}

function allGroups() {
    axios.post('/allGroups', { token: token })
        .then(res =>  res.data[0].groups.forEach(e => addElements('groups',e.groupName, e.id)))
        swicthGroup('1')
}

allGroups();

async function addUserToGroup(e) {
   await axios.post('/addUserToGroup', { token: token, userId: e.target.id, groupId: currentGroupId }).then(res => alert(res.data.msg));
   allUsers();
}

 async function removeUser(e) {
    await axios.post('/removeUser', { token: token, groupId: currentGroupId, userId: e.target.id });
    allGroupUsers();
}

document.getElementById('upload').addEventListener('click',(e)=>{
    console.log((document.querySelector('input[type=file]').files[0]))
    let formData = new FormData();
    formData.append("file", document.querySelector('input[type=file]').files[0]);
    
    axios.post('/upload', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      }).then(async res => {
        await axios.post('/addMessage', { groupId: currentGroupId, message: res.data.link, token: token })
        .then(res => {
            if (res.status == 201) return null
            else alert('something went wrong');
        }).catch(err => console.log(err))
    socket.emit('sendMessage', {user: localStorage.getItem('user'),message:res.data.link});
        
      })
})
