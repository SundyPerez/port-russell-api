const token = localStorage.getItem("token");
const tableBody = document.querySelector("#usersTable tbody");
let editingUserEmail = null;

async function loadUsers() {
  const res = await fetch("http://localhost:3000/api/users", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const users = await res.json();

  tableBody.innerHTML = "";

  users.forEach(user => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td>
        <button onclick="editUser('${user._id}', '${user.username}', '${user.email}')">Modifier</button>
        <button onclick="deleteUser('${user._id}')">Supprimer</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

function showForm() {
  document.getElementById("formDiv").style.display = "block";
}

function hideForm() {
  document.getElementById("formDiv").style.display = "none";
  editingUserEmail = null;
  document.getElementById("username").value = "";
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";
}

function editUser(id, username, email) {
  editingUserEmail = email;
  document.getElementById("username").value = username;
  document.getElementById("email").value = email;
  showForm();
}

async function saveUser() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const method = editingUserEmail ? "PUT" : "POST";
  const url = editingUserEmail
    ? `http://localhost:3000/api/users/${editingUserEmail}`
    : `http://localhost:3000/api/users`;

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ username, email, password })
  });

  hideForm();
  loadUsers();
}

async function deleteUser(id) {
  if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
  await fetch(`http://localhost:3000/api/users/${id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  loadUsers();
}

loadUsers();
