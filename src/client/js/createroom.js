import { load_rooms } from "./chats.js";

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
        modal.classList.add("hidden");
    };

    // CLICK OUTSIDE
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
    });

    // CREATE ROOM
    document.getElementById("create_room_btn").onclick = async () => {

        const room_name = document.getElementById("room_name").value.trim();

        const selectedUsers = Array.from(
            document.querySelectorAll("#user_list input:checked")
        ).map(cb => cb.value);

        if (room_name === "" || selectedUsers.length === 0) {
            alert("Enter room name and select users");
            return;
        }

        selectedUsers.push(user_id);

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

        modal.classList.add("hidden");
        document.getElementById("room_name").value = "";
    };

    // LOAD USERS INTO MODAL
    async function load_users_into_modal() {
        const res = await fetch("https://cn483.brighton.domains/soundshare/src/server/api.php?get_users=1");
        const obj = await res.json();

        const userList = document.getElementById("user_list");
        userList.innerHTML = "";

        obj.users.forEach(user => {
            const div = document.createElement("div");

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = user.user_id;

            const label = document.createElement("label");
            label.textContent = user.fname + " " + user.lname;

            div.appendChild(checkbox);
            div.appendChild(label);

            userList.appendChild(div);
        });
    }
}