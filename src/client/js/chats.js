export let current_user = null;
export let current_receiver = null;

window.addEventListener('load', function () {
    let user_id = null;

    const js_display_id = document.getElementById("display_id");
    js_display_id.textContent = "User ID: " + user_id;

});

document.getElementById("uid_form").addEventListener("submit", function (event) {
    event.preventDefault();

    let user_id = document.getElementById("uid").value;

    document.getElementById("display_id").textContent = user_id;

    render_new_chat_form();
    render_chat_ui();

    load_chats(user_id);
});

document.getElementById("new_chat_form").addEventListener("submit", function (event) {
    event.preventDefault();

    let user_id = document.getElementById("uid").value;
    let nc_user_id = document.getElementById("nc_uid").value;

    document.getElementById("chat_list").innerHTML = "";


    const h4 = document.createElement("h4");
    h4.textContent = "New Chat with User ID " + nc_user_id;
    this.appendChild(h4);

    new_chat(nc_user_id, user_id);
});

async function load_chats(user_id) {
    const url = `https://cn483.brighton.domains/soundshare/src/server/api.php?user=${user_id}`;

    try {

        const response = await fetch(url);
        const text = await response.text();
        const obj = JSON.parse(text);

        conversation_list(user_id, obj)

    } catch (error) {
        console.log(error);
    }
};

//conversation list
async function conversation_list(user_id, obj) {
    const unique_chats = new Set();

    for (const item of obj.chat) {
        const sender = item.dm_chat_sender;
        const receiver = item.dm_chat_receiver;

        if (user_id == receiver) {
            // someone messaged the user
            unique_chats.add(sender);
        } else if (user_id == sender) {
            // user messaged someone (even if no reply)
            unique_chats.add(receiver);
        }
    }

    // Clear existing list (important if reloading)
    const chatList = document.getElementById("chat_list");
    chatList.innerHTML = "";

    for (const chatUserId of unique_chats) {
        const name = await get_user_name(chatUserId);

        const div = document.createElement("div");
        div.classList.add("chat-card");

        const button = document.createElement("button");
        button.textContent = name;
        button.id = chatUserId;

        button.addEventListener("click", function () {
            message_in_a_chat(user_id, chatUserId);
        });

        div.appendChild(button);
        chatList.appendChild(div);
    }
}

async function get_user_name(user_id) {
    const url = `https://cn483.brighton.domains/soundshare/src/server/api.php?userid-name=${user_id}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const obj = JSON.parse(text);

        for (const item of obj.name) {
            const fname = item.fname;
            const lname = item.lname;
            return fname + " " + lname;
        }

    } catch (error) {
        console.log(error);
    }
}

//output messages in chat box
async function message_in_a_chat(user_id, sender_id) {
    current_user = user_id;
    current_receiver = sender_id;

    const url = `https://cn483.brighton.domains/soundshare/src/server/api.php?sender=${sender_id}&receiver=${user_id}`;

    try {

        const response = await fetch(url);
        const text = await response.text();
        const obj = JSON.parse(text);


        const chatBox = document.getElementById("chat");
        chatBox.innerHTML = "";

        const messageBox = document.getElementById("message_box");
        messageBox.innerHTML = "";

        for (const item of obj.chat) {

            const next_message = document.createElement("div");

            next_message.classList.add(
                item.sender == sender_id ? "received" : "sent"
            );

            if (item.type === "chat") {
                const text = document.createElement("p");
                text.textContent = item.content;
                next_message.appendChild(text);
            }

            if (item.type === "audio") {
                next_message.innerHTML = `
            <audio controls>
                <source src="https://cn483.brighton.domains/soundshare/src/server/${item.content}" type="audio/mpeg">
            </audio>
        `;
            }

            chatBox.appendChild(next_message);

        }

        user_sending_message(user_id, sender_id, messageBox)


        // scroll to newest message
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        console.log(error);
    }
}

function user_sending_message(user_id, sender_id, messageBox) {
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


    // Add click event
    button.addEventListener("click", () => {
        const message = input.value;
        send_message(sender_id, user_id, message);

    });

};

//send message method
async function send_message(sender_id, user_id, message) {
    const message_to = sender_id;
    const message_from = user_id

    const formData = new FormData();
    formData.append("message_to", message_to);
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
        message_in_a_chat(user_id, sender_id);

    } catch (error) {
        console.log(error);
    }
}

//upload audio
//upload audio
export async function upload_audio(blob, current_user, current_receiver) {

    const formData = new FormData();

    formData.append("message_to", current_receiver);
    formData.append("message_from", current_user);
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