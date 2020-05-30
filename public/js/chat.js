const socket = io();

// HTML elements
const $sendMsg = document.querySelector("#send-msg");
const $inputMsg = document.querySelector("#input-msg");
const $sendLocation = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#chat-sidebar");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // New message element height
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of message container
  const conatinerHeight = $messages.scrollHeight;

  // How much have I scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  console.log(conatinerHeight - newMessageHeight);
  console.log(scrollOffset);

  const condition = conatinerHeight - newMessageHeight <= scrollOffset;

  if (condition) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });

  $messages.insertAdjacentHTML("beforeend", html);

  autoscroll();
});

socket.on("locationMessage", (locationMessage) => {
  const html = Mustache.render(locationTemplate, {
    username: locationMessage.username,
    url: locationMessage.url,
    createdAt: moment(locationMessage.createdAt).format("h:mm a"),
  });

  $messages.insertAdjacentHTML("beforeend", html);

  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });

  $sidebar.innerHTML = html;
});

$sendMsg.addEventListener("click", (e) => {
  e.preventDefault();

  $sendMsg.setAttribute("disabled", "disabled");

  const message = $inputMsg.value;

  socket.emit("sendMessage", message, (error) => {
    $sendMsg.removeAttribute("disabled");
    $inputMsg.value = "";

    if (error) {
      return console.log(error);
    }

    console.log("Message was delivered!");
  });
});

$sendLocation.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Geolocation not supported!");
  }

  $sendLocation.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const location = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    };
    socket.emit("sendLocation", location, () => {
      $sendLocation.removeAttribute("disabled");
      console.log("Location shared");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
