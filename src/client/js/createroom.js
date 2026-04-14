document.getElementById("create_room_btn").addEventListener("click", async () => {

    console.log("clicked");
    console.log(user_id);

    const room_name = document.getElementById("room_name").value.trim();

    const selectedUsers = Array.from(
        document.querySelectorAll("#user_list input:checked")
    ).map(cb => cb.value);

    if (room_name === "" || selectedUsers.length === 0) {
        alert("Enter room name and select users");
        return;
    }

    selectedUsers.push(user_id);

    console.log(selectedUsers);

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

        console.log(response);
        
        if (!response.ok) {
            console.log("Failed to create room");
        } else {
            console.log("room made");
        }

    } catch (error) {
        console.log(error);
    }

    // close modal + reset
    modal.classList.add("hidden");
    document.getElementById("room_name").value = "";
});

const modal = document.getElementById("room_modal");

document.getElementById("close_modal").onclick = () => {
    modal.classList.add("hidden");
};

// click outside to close
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.add("hidden");
    }
});

async function load_users_into_modal() {
    const res = await fetch("https://cn483.brighton.domains/soundshare/src/server/api.php?get_users=1");
    const obj = await res.json();

    const container = document.getElementById("user_list");
    container.innerHTML = "";

    obj.users.forEach(user => {
        const div = document.createElement("div");
        div.classList.add("user-item");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = user.user_id;

        const label = document.createElement("label");
        label.textContent = user.fname + " " + user.lname;

        div.appendChild(checkbox);
        div.appendChild(label);

        container.appendChild(div);
    });
}

document.getElementById("open_modal").onclick = () => {
    modal.classList.remove("hidden");
    load_users_into_modal();
};