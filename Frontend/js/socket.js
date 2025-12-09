(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user?._id) return;

  const socket = io(BASE_URL);

  socket.on("connect", () => {
    socket.emit("join", user._id);
  });

  socket.on("newNotification", (notification) => {
    const list = document.getElementById("notifications-list");
    const li = document.createElement("li");
    li.textContent = `${notification.type} on your post`;
    list.appendChild(li);
  });

  socket.on("message:new", (msg) => {
    const list = document.getElementById("messages-list");
    const li = document.createElement("li");
    li.textContent = `${msg.fromName}: ${msg.text}`;
    list.appendChild(li);
  });

  window.sendMessage = (toUserId, text) => {
    socket.emit("message:send", { to: toUserId, text });
  };
})();