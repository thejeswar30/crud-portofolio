const addButton = document.getElementById("addButton");
const emptyAddButton = document.getElementById("emptyAddButton");
const formPanel = document.getElementById("formPanel");
const userForm = document.getElementById("userForm");
const formTitle = document.getElementById("formTitle");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const formError = document.getElementById("formError");
const userTable = document.getElementById("userTable");
const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyDescription = document.getElementById("emptyDescription");
const searchInput = document.getElementById("searchInput");
const recordCount = document.getElementById("recordCount");
const resultCount = document.getElementById("resultCount");
const toast = document.getElementById("toast");

const storageKey = "crudManagementRecords";

let users = [];
let editingId = null;
let toastTimer;

try {
const savedUsers = JSON.parse(localStorage.getItem(storageKey) || "[]");

```
if (Array.isArray(savedUsers)) {
    users = savedUsers.filter(function (user) {
        return user &&
            typeof user.id === "string" &&
            typeof user.name === "string" &&
            typeof user.email === "string";
    });
}
```

} catch (error) {
users = [];
}

function saveUsers() {
try {
localStorage.setItem(storageKey, JSON.stringify(users));
return true;
} catch (error) {
showToast("Unable to save data in this browser.");
return false;
}
}

function showToast(message) {
clearTimeout(toastTimer);
toast.textContent = message;
toast.classList.add("show");

```
toastTimer = setTimeout(function () {
    toast.classList.remove("show");
}, 2800);
```

}

function openForm(user) {
editingId = user ? user.id : null;

```
formTitle.textContent = user ? "Edit Record" : "Add New Record";
saveButton.textContent = user ? "Update Record" : "Save Record";

nameInput.value = user ? user.name : "";
emailInput.value = user ? user.email : "";
formError.textContent = "";

formPanel.hidden = false;
addButton.hidden = true;
emptyAddButton.hidden = true;

nameInput.focus();

formPanel.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
});
```

}

function closeForm() {
userForm.reset();
formPanel.hidden = true;
addButton.hidden = false;
emptyAddButton.hidden = false;
editingId = null;
formError.textContent = "";
}

function createCell(value) {
const cell = document.createElement("td");
cell.textContent = value;
return cell;
}

function renderUsers() {
const query = searchInput.value.trim().toLowerCase();

```
const filteredUsers = users.filter(function (user) {
    return user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
});

userTable.replaceChildren();

filteredUsers.forEach(function (user) {
    const row = document.createElement("tr");

    row.appendChild(createCell(user.name));
    row.appendChild(createCell(user.email));

    const actionCell = document.createElement("td");
    const actionButtons = document.createElement("div");

    actionButtons.className = "action-buttons";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "edit-button";
    editButton.textContent = "Edit";
    editButton.setAttribute("aria-label", "Edit " + user.name);

    editButton.addEventListener("click", function () {
        openForm(user);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", "Delete " + user.name);

    deleteButton.addEventListener("click", function () {
        deleteUser(user.id);
    });

    actionButtons.append(editButton, deleteButton);
    actionCell.appendChild(actionButtons);
    row.appendChild(actionCell);
    userTable.appendChild(row);
});

recordCount.textContent = users.length;
resultCount.textContent =
    filteredUsers.length + (filteredUsers.length === 1 ? " result" : " results");

emptyState.hidden = filteredUsers.length > 0;

if (users.length === 0) {
    emptyTitle.textContent = "No records yet";
    emptyDescription.textContent =
        "Click Add New to create your first record.";
    emptyAddButton.hidden = false;
} else if (filteredUsers.length === 0) {
    emptyTitle.textContent = "No matching records";
    emptyDescription.textContent =
        "Try a different name or email search.";
    emptyAddButton.hidden = true;
} else {
    emptyAddButton.hidden = true;
}
```

}

function deleteUser(id) {
const user = users.find(function (item) {
return item.id === id;
});

```
if (!user) {
    return;
}

const confirmed = window.confirm(
    "Are you sure you want to delete " + user.name + "?"
);

if (!confirmed) {
    return;
}

const previousUsers = users;
users = users.filter(function (item) {
    return item.id !== id;
});

if (!saveUsers()) {
    users = previousUsers;
    return;
}

if (editingId === id) {
    closeForm();
}

renderUsers();
showToast("Record deleted successfully.");
```

}

function createId() {
if (window.crypto && typeof window.crypto.randomUUID === "function") {
return window.crypto.randomUUID();
}

```
return Date.now().toString(36) +
    Math.random().toString(36).slice(2);
```

}

addButton.addEventListener("click", function () {
openForm(null);
});

emptyAddButton.addEventListener("click", function () {
openForm(null);
});

cancelButton.addEventListener("click", closeForm);

searchInput.addEventListener("input", renderUsers);

userForm.addEventListener("submit", function (event) {
event.preventDefault();

```
const name = nameInput.value.trim();
const email = emailInput.value.trim();

formError.textContent = "";

if (!name || !email) {
    formError.textContent = "Please enter both name and email.";
    return;
}

const duplicate = users.some(function (user) {
    return user.email.toLowerCase() === email.toLowerCase() &&
        user.id !== editingId;
});

if (duplicate) {
    formError.textContent = "A record with this email already exists.";
    emailInput.focus();
    return;
}

const previousUsers = users.map(function (user) {
    return { ...user };
});

if (editingId !== null) {
    users = users.map(function (user) {
        if (user.id === editingId) {
            return {
                id: user.id,
                name: name,
                email: email
            };
        }

        return user;
    });
} else {
    users.push({
        id: createId(),
        name: name,
        email: email
    });
}

if (!saveUsers()) {
    users = previousUsers;
    return;
}

const wasEditing = editingId !== null;

closeForm();
renderUsers();

showToast(
    wasEditing
        ? "Record updated successfully."
        : "Record added successfully."
);
```

});

renderUsers();
