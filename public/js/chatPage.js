import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
axios.defaults.headers.common['X-Auth-Token'] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';


const message = document.getElementById('messageBlock');
const groupUsers = document.getElementById("groupUsers");
const userBlock = document.getElementById("userBlock");
const chat = document.getElementById("chat");
document.getElementById('send').addEventListener('click', addMessage);
document.getElementById('newGroup')
    .addEventListener('click', () => {
        userBlock.style.display = 'block';
        groupUsers.style.display = 'none'
    });
document.getElementById('deleteGroup').addEventListener('click', deleteGroup);
document.getElementById('createGroup').addEventListener('click', createGroup)
document.getElementById('removeUserButton').addEventListener('click', allGroupUsers)
document.getElementById('addUserButton').addEventListener('click', allUsers)
const groupName = document.getElementById('groupName');
const groups = document.getElementById('groups');
document.getElementById('groupList').addEventListener('click', () => {
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
    addElements('chat', data.user + ' : ' + data.message, data.message)
})
socket.on('userAdded', data => {
    allGroups()
})


//setInterval(allMessages,1000);

//allMessages(currentGroupId);

function addElements(parent, data, id) {
    id = String(id)
    if (parent == 'chat') {
        let p = document.createElement('p')
        if (id.includes('http')) {
            let a = document.createElement('a')
            a.innerHTML = data
            a.setAttribute('href', id)
            p.appendChild(a);
            document.getElementById(parent).appendChild(p);
            //document.getElementById(parent).appendChild(document.createElement('br'));

        }
        else {
            p.innerHTML = data
            document.getElementById(parent).appendChild(p);
        }
        chat.scrollTop = chat.scrollHeight - chat.clientHeight;

    }

    else {
        let li = document.createElement('input');
        li.setAttribute('type', 'submit');
        li.setAttribute('id', id);
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
    socket.emit('sendMessage', { user: localStorage.getItem('user'), message: message.value });
    message.value = '';
}

function createGroup() {
    axios.post('/createGroup', { token: token, groupName: groupName.value })
        .then(res => addElements('groups', groupName.value, res.data.i));

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
            chat.innerHTML = '';
            document.querySelector('label').innerHTML = res.data[0].groupName;
            res.data[0].messages.reverse().forEach(e => {

                addElements('chat', e.user.Name + " : " + e.message, e.message);
            })
        });


    if (currentGroupId !== '1') document.getElementById('userEdit').style.display = 'block';
    else document.getElementById('userEdit').style.display = 'none';
    document.getElementById('users').style.display = 'none'
}


function allGroupUsers() {
    groups.style.display = 'none'
    groupUsers.style.display = 'block'
    groupUsers.addEventListener('click', removeUser)

}

async function allUsers() {
    document.getElementById("users").innerHTML = '';
    await axios.post('/allUsers', { token: token, groupId: currentGroupId })
        .then(res => {
            res.data.forEach(e => addElements('users', e.Name, e.id));
        }).catch(res => alert(res.response.data.msg))
    groupUsers.style.display = 'none';
    userBlock.style.display = 'block';
}

function allGroups() {
    axios.post('/allGroups', { token: token })
        .then(res => {
            groups.innerHTML = '';
            res.data[0].groups.forEach(e => addElements('groups', e.groupName, e.id))
        })
    swicthGroup('1')
}

allGroups();

async function addUserToGroup(e) {
    await axios.post('/addUserToGroup', { token: token, userId: e.target.id, groupId: currentGroupId })
        .then(res => {
            alert(res.data.msg);
            socket.emit('addUser', {})
        });

}

async function removeUser(e) {
    await axios.post('/removeUser', { token: token, groupId: currentGroupId, userId: e.target.id }).then(res => allGroupUsers());

}

document.getElementById('upload').addEventListener('click', (e) => {
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
        socket.emit('sendMessage', { user: localStorage.getItem('user'), message: res.data.link });

    })
})

function deleteGroup() {
    axios.delete('/deleteGroup', { headers: { groupId: currentGroupId, token } })
        .then(res => { if (res.status == 204) allGroups() })
        .catch(err => console.log(err.code));
}