import { init_audio_recorder } from "./audiorecord.js";
import { init_new_room} from "./createroom.js";

window.addEventListener('load', function () {

    let user_id = localStorage.getItem("user_id");

    if (!user_id) {
        window.location.href = "index.html"; // your login/signup page
        return;
    }

    const js_display_id = document.getElementById("display_id");
    js_display_id.textContent = "User ID: " + user_id;

    render_chat_ui();
    load_rooms(user_id);
    init_new_room(user_id);
});

// GETS THE ROOMS THAT THE USER IS IN
export async function load_rooms(user_id) {
    const url = `https://cn483.brighton.domains/soundshare/src/server/api.php?user_room=${user_id}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const obj = JSON.parse(text);

        display_rooms(user_id, obj);

    } catch (error) {
        console.log(error);
    }
};

//OUTPUTS THE ROOMS THAT THE USER IS IN ON WEBB PAGE
async function display_rooms(user_id, obj) {
    // Clear existing list (important if reloading)
    const chatList = document.getElementById("chat_list");
    chatList.innerHTML = "";

    const unique_rooms = new Set();

    for (const item of obj.rooms) {
        const room_id = item.room_id;
        unique_rooms.add(room_id);

        const name = await get_room_name(room_id);

        const div = document.createElement("div");
        div.classList.add("chat-card");

        const button = document.createElement("button");
        button.textContent = name;
        button.id = room_id;

        button.addEventListener("click", function () {
            messages_in_a_room(user_id, room_id);
        });

        div.appendChild(button);
        chatList.appendChild(div);
    }
}

async function get_room_name(room_id) {
    const url = `https://cn483.brighton.domains/soundshare/src/server/api.php?room_name=${room_id}`;

    try {
        const response = await fetch(url);
        const obj = await response.json();

        if (obj.room_name && obj.room_name.length > 0) {
            return obj.room_name[0].room_name;
        } else {
            return "Unnamed Room";
        }

    } catch (error) {
        console.log(error);
        return "Error loading room";
    }
}

async function messages_in_a_room(user_id, room_id) {

    const url = `https://cn483.brighton.domains/soundshare/src/server/api.php?room=${room_id}`;

    try {
        const response = await fetch(url);
        const obj = await response.json();

        const chatBox = document.getElementById("chat");
        chatBox.innerHTML = "";

        const messageBox = document.getElementById("message_box");
        messageBox.innerHTML = "";

        for (const item of obj.messages) {

            const next_message = document.createElement("div");

            next_message.classList.add(
                item.message_sender == user_id ? "sent" : "received"
            );

            const message_box = document.createElement("div");
            message_box.classList.add("message_box");

            if (item.message_sender != user_id) {
                const name = document.createElement("p");
                name.classList.add("name");
                name.textContent = item.sender_name;
                message_box.appendChild(name);
            }

            if (item.contents.startsWith("uploads/audio")) {
                // audio message
                const audio = document.createElement("audio");
                audio.controls = true;

                const source = document.createElement("source");
                source.src = `https://cn483.brighton.domains/soundshare/src/server/${item.contents}`;
                source.type = "audio/mpeg";

                audio.appendChild(source);
                message_box.appendChild(audio);

            } else {
                // text message
                const text = document.createElement("p");
                text.textContent = item.contents;
                message_box.appendChild(text);
            }

            next_message.appendChild(message_box)
            chatBox.appendChild(next_message);
        }

        user_sending_message(user_id, room_id, messageBox);

        // scroll to newest message
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        console.log(error);
    }
}

function user_sending_message(user_id, room_id, messageBox) {
    // Create input
    const input = document.createElement("input");
    input.type = "text";
    input.id = "message_input";
    input.placeholder = "Type a message...";

    // Create button
    const button = document.createElement("button");
    button.id = "send_button";
    button.textContent = "Send";

    // Create audio record button
    const rec_button = document.createElement("button");
    rec_button.id = "rec_audio_toggle";
    rec_button.textContent = "Record Audio";


    // Add elements to message box
    messageBox.appendChild(input);
    messageBox.appendChild(button);
    messageBox.appendChild(rec_button);

    const check_input = document.getElementById("message_input");
    const check_button = document.getElementById("send_button");

    check_input.addEventListener("input", function () {
        check_button.disabled = input.value.trim() === "";
    });

    // Add click event
    button.addEventListener("click", () => {
        const message = input.value;
        send_message(room_id, user_id, message);
    });

    rec_button.addEventListener("click", () => {
        init_audio_recorder(user_id, room_id);
    });

}

//send message method
async function send_message(room_id, user_id, message) {
    const message_from = user_id;

    const formData = new FormData();
    formData.append("room_id", room_id);
    formData.append("message_from", message_from);
    formData.append("message", message);

    try {
        const response = await fetch(
            "https://cn483.brighton.domains/soundshare/src/server/api.php",
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            console.log("Failed to send message");
        } else {
            console.log("Message sent");
        }
        messages_in_a_room(user_id, room_id);

    } catch (error) {
        console.log(error);
    }
}

//upload audio
export async function upload_audio(blob, user_id, room_id) {

    const formData = new FormData();

    formData.append("room_id", room_id);
    formData.append("message_from", user_id);
    formData.append("audio", blob, "recording.webm");

    try {

        const response = await fetch(
            "https://cn483.brighton.domains/soundshare/src/server/api.php",
            {
                method: "POST",
                body: formData
            }
        );

        const text = await response.text();

        if (!text || text.trim() === "") {
            console.log("Empty response from API");
            return;
        }

        const data = JSON.parse(text);
        console.log("Upload success");

        messages_in_a_room(user_id, room_id);
        return data;

    } catch (error) {
        console.error("Upload error:", error);
    }
}

//new chat
async function new_chat(nc_uid, user_id) {
    const nc_div = document.querySelector(".new_chat");

    const messageBox = document.createElement("div");
    messageBox.id = "nc_message_box_" + nc_uid;

    nc_div.appendChild(messageBox);

    console.log(user_id + nc_uid);

    user_sending_message(user_id, nc_uid, messageBox);
}

function render_new_chat_form() {
    const container = document.querySelector(".new_chat");

    container.innerHTML = "";


    const title = document.createElement("h3");
    title.textContent = "New Chat";


    const form = document.createElement("form");
    form.id = "new_chat_form";

    const label = document.createElement("label");
    label.setAttribute("for", "nc_uid");
    label.textContent = "Enter the ID of the person you want to start a chat with:";


    const input = document.createElement("input");
    input.type = "text";
    input.id = "nc_uid";
    input.name = "nc_uid";


    const submit = document.createElement("input");
    submit.type = "submit";
    submit.value = "Submit";
    submit.id = "nc_uid_submit";


    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(submit);

    container.appendChild(title);
    container.appendChild(form);

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const nc_uid = document.getElementById("nc_uid").value;
        console.log("New chat with:", nc_uid);

        new_chat(nc_uid);
    });
}

function render_chat_ui() {
    //chat list
    const chatListContainer = document.querySelector(".chat_list");

    chatListContainer.innerHTML = "";

    const chatListTitle = document.createElement("h3");
    chatListTitle.textContent = "Chat List";

    const chatListDiv = document.createElement("div");
    chatListDiv.id = "chat_list";

    chatListContainer.appendChild(chatListTitle);
    chatListContainer.appendChild(chatListDiv);

    //conversation
    const conversationContainer = document.querySelector(".conversation");

    conversationContainer.innerHTML = "";

    const conversationTitle = document.createElement("h3");
    conversationTitle.textContent = "Conversation";

    const chatDiv = document.createElement("div");
    chatDiv.id = "chat";

    const messageBox = document.createElement("div");
    messageBox.id = "message_box";

    conversationContainer.appendChild(conversationTitle);
    conversationContainer.appendChild(chatDiv);
    conversationContainer.appendChild(messageBox);
}

document.getElementById("logout").onclick = () => {

    // Clear stored user data
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");

    // Redirect to login/home page
    window.location.href = "index.html";
};