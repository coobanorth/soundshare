import { load_rooms } from "./chats.js";
import { new_chat } from "./chats.js";

let selected_users = [];

export function init_new_room(user_id) {

    const container = document.querySelector(".new_room");

    container.innerHTML = `
        <button id="open_modal">New Chat</button>

        <div id="room_modal" class="hidden modal">
            <div class="modal-content">
                <h3>New Chat</h3>

                <input type="text" id="room_name" placeholder="New Chat Name" />

                <div id="user_list"></div>

                <button id="create_room_btn">Create</button>
                <button id="close_modal">Cancel</button>
            </div>
        </div>
    `;

    const modal = document.getElementById("room_modal");

    // OPEN MODAL
    document.getElementById("open_modal").onclick = () => {
        modal.classList.remove("hidden");
        load_users_into_modal();
    };

    // CLOSE MODAL
    document.getElementById("close_modal").onclick = () => {
        selected_users = []; 
        modal.classList.add("hidden");
        document.getElementById("room_name").value = "";
    };

    // CLICK OUTSIDE
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            selected_users = [];
            modal.classList.add("hidden");
            document.getElementById("room_name").value = "";
        }
    });

    // CREATE ROOM
    document.getElementById("create_room_btn").onclick = async () => {

        const room_name = document.getElementById("room_name").value.trim();

        const selectedUsers = selected_users.map(u => u.user_id);

        if (room_name === "" || selectedUsers.length === 0) {
            alert("Enter room name and select users");
            return;
        }

        // add yourself
        if (!selectedUsers.includes(user_id)) {
            selectedUsers.push(user_id);
        }

        const formData = new FormData();
        formData.append("action", "create_room");
        formData.append("room_name", room_name);
        formData.append("room_creator", user_id);

        selectedUsers.forEach(user => {
            formData.append("users[]", user);
        });

        try {
            const response = await fetch(
                "https://cn483.brighton.domains/soundshare/src/server/api.php",
                {
                    method: "POST",
                    body: formData
                }
            );

            if (response.ok) {
                await load_rooms(user_id);
            } else {
                console.log("Failed to create room");
            }

        } catch (error) {
            console.log(error);
        }

        // reset after creation
        selected_users = [];
        modal.classList.add("hidden");
        document.getElementById("room_name").value = "";
    };

    // LOAD USERS INTO MODAL
    async function load_users_into_modal() {

        const userList = document.getElementById("user_list");
        userList.innerHTML = "";

        // Search input
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Enter User ID...";

        const button = document.createElement("button");
        button.textContent = "Search";

        userList.appendChild(input);
        userList.appendChild(button);

        // Search results
        const resultsDiv = document.createElement("div");
        userList.appendChild(resultsDiv);

        // Selected users list
        const selectedDiv = document.createElement("div");
        selectedDiv.id = "selected_users";
        selectedDiv.innerHTML = "<h4>Selected Users:</h4>";

        userList.appendChild(selectedDiv);

        button.addEventListener("click", async () => {

            const searchValue = input.value.trim();
            if (!searchValue) return;

            resultsDiv.innerHTML = "Searching...";

            try {
                const res = await fetch(
                    `https://cn483.brighton.domains/soundshare/src/server/api.php?userid-name=${searchValue}`
                );

                const obj = await res.json();

                resultsDiv.innerHTML = "";

                if (!obj.name || obj.name.length === 0) {
                    resultsDiv.textContent = "No user found";
                    return;
                }

                const user = obj.name[0];

                const div = document.createElement("div");

                const name = document.createElement("p");
                name.textContent = `${user.fname} ${user.lname} (ID: ${searchValue})`;

                const addBtn = document.createElement("button");
                addBtn.textContent = "Add";

                addBtn.addEventListener("click", () => {

                    // prevent duplicates
                    if (selected_users.some(u => u.user_id === searchValue)) return;

                    selected_users.push({
                        user_id: searchValue,
                        fname: user.fname,
                        lname: user.lname
                    });

                    render_selected_users(selectedDiv);
                    input.value = "";
                });

                div.appendChild(name);
                div.appendChild(addBtn);

                resultsDiv.appendChild(div);

            } catch (err) {
                console.log(err);
                resultsDiv.textContent = "Error searching user";
            }
        });
    }
}

function render_selected_users(container) {

    // keep title
    container.innerHTML = "<h4>Selected Users:</h4>";

    selected_users.forEach(user => {

        const div = document.createElement("div");

        const text = document.createElement("span");
        text.textContent = `${user.fname} ${user.lname} (ID: ${user.user_id})`;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";

        removeBtn.addEventListener("click", () => {
            selected_users = selected_users.filter(u => u.user_id !== user.user_id);
            render_selected_users(container);
        });

        div.appendChild(text);
        div.appendChild(removeBtn);

        container.appendChild(div);
    });
}