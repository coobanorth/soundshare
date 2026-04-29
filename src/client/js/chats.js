import { init_audio_recorder } from "./audiorecord.js";
import { init_new_room } from "./createroom.js";

let current_room_id = null;
let message_polling = null;
let last_message_id = 0;

window.addEventListener("beforeunload", () => {
    if (message_polling) clearInterval(message_polling);
});

window.addEventListener('load', function () {

    let user_id = localStorage.getItem("user_id");

    if (!user_id) {
        window.location.href = "index.html";
        return;
    }

    const js_display_id = document.getElementById("display_id");
    js_display_id.textContent = "Welcome " + localStorage.getItem("user_name") + " || UID#" + user_id;

    render_chat_ui();
    load_rooms(user_id);
    init_new_room(user_id);
});

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

async function display_rooms(user_id, obj) {

    const chatList = document.getElementById("chat_list");
    chatList.innerHTML = "";

    for (const item of obj.rooms) {

        const room_id = item.room_id;

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
        const messageBox = document.getElementById("message_box");

        const switching_room = current_room_id !== room_id;

        if (switching_room) {
            chatBox.innerHTML = "";
            messageBox.innerHTML = "";
            last_message_id = 0; // FIX: reset message tracking
        }

        current_room_id = room_id;

        // clear old polling safely
        if (message_polling) {
            clearInterval(message_polling);
            message_polling = null;
        }

        for (const item of obj.messages) {

            if (!switching_room && item.message_id <= last_message_id) {
                continue;
            }

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

                const audio = document.createElement("audio");
                audio.controls = true;

                const source = document.createElement("source");
                source.src = `https://cn483.brighton.domains/soundshare/src/server/${item.contents}`;
                source.type = "audio/webm";

                audio.appendChild(source);
                message_box.appendChild(audio);

            } else {

                const text = document.createElement("p");
                text.textContent = item.contents;
                message_box.appendChild(text);
            }

            next_message.appendChild(message_box);
            chatBox.appendChild(next_message);

            last_message_id = item.message_id;
        }

        // ensure input only rendered once per room switch
        if (switching_room) {
            messageBox.innerHTML = "";
            user_sending_message(user_id, room_id, messageBox);
        }

        message_polling = setInterval(() => {
            messages_in_a_room(user_id, room_id);
        }, 2000);

    } catch (error) {
        console.log(error);
    }
}

function user_sending_message(user_id, room_id, messageBox) {

    const input = document.createElement("input");
    input.type = "text";
    input.id = "message_input";
    input.placeholder = "Type a message...";

    const button = document.createElement("button");
    button.id = "send_button";
    button.textContent = "Send";

    const rec_button = document.createElement("button");
    rec_button.id = "rec_audio_toggle";
    rec_button.textContent = "Record Audio";

    messageBox.appendChild(input);
    messageBox.appendChild(button);
    messageBox.appendChild(rec_button);

    input.addEventListener("input", function () {
        button.disabled = input.value.trim() === "";
    });

    button.addEventListener("click", () => {
        const message = input.value.trim();

        if (message === "") return;

        send_message(room_id, user_id, message);

        input.value = "";
        button.disabled = true;
    });

    rec_button.addEventListener("click", () => {
        init_audio_recorder(user_id, room_id);
    });
}

async function send_message(room_id, user_id, message) {

    const formData = new FormData();
    formData.append("room_id", room_id);
    formData.append("message_from", user_id);
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

export async function new_chat(nc_uid, user_id) {
    const nc_div = document.querySelector(".new_chat");

    const messageBox = document.createElement("div");
    messageBox.id = "nc_message_box_" + nc_uid;

    nc_div.appendChild(messageBox);

    console.log(user_id + nc_uid);

    user_sending_message(user_id, nc_uid, messageBox);
}

function render_chat_ui() {

    const chatListContainer = document.querySelector(".chat_list");
    chatListContainer.innerHTML = "";

    const chatListTitle = document.createElement("h3");
    chatListTitle.textContent = "Chat List";

    const chatListDiv = document.createElement("div");
    chatListDiv.id = "chat_list";

    chatListContainer.appendChild(chatListTitle);
    chatListContainer.appendChild(chatListDiv);

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

    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");

    window.location.href = "index.html";
};