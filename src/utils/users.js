const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  // Check for existing user
  const existingUser = users.find(
    (user) => user.room === room && user.username === username
  );

  // Validate username
  if (existingUser) {
    return {
      error: "Username in use!",
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  // Find the index of user by id in the users array
  const index = users.findIndex((user) => user.id === id);

  // Remove user if index found
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  // Find the user by id in the users array
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
