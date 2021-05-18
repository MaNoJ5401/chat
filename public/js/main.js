const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//Get username and room details from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// join chatroom
socket.emit('joinRoom', {username, room });

//Get room and users 
socket.on('roomUsers', ({room, users }) =>{
    outputRoomName(room);
    outputUsers(users);
} );

// Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // scroll down when msg recieved
chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit
chatForm.addEventListener('submit', (e) => {
e.preventDefault();

// getting message text by msg id in chat.html
const msg =e.target.elements.msg.value;

// Emitting the message typed into the server 
socket.emit('chatMessage', msg);

// clear the input msg after it's sent and focus on the message input bar
e.target.elements.msg.value ='';
e.target.elements.msg.focus();
});

// output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;

    // entering the message into the DOM by using the chat-messages class from chat.html
    // when we create a msg it creates new div in chat-messages
    document.querySelector('.chat-messages').appendChild(div);
}

//add room name to DOM 
function outputRoomName(room) {
roomName.innerText = room;
}

//add users to DOM
function outputUsers(users){
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}