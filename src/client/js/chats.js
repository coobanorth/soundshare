window.addEventListener('load', function () {
    let user_id = 1;

    const js_display_id = document.getElementById("display_id");
    js_display_id.textContent = "User ID: " + user_id;

    load_chats(user_id);
});

async function load_chats(user_id) {
    const url = 'https://cn483.brighton.domains/soundshare/src/server/api.php?chat=all';

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
        const dm_chat_sender = item.dm_chat_sender;

        if (user_id != dm_chat_sender) {
            unique_chats.add(dm_chat_sender);
        }
    }

    for (const x of unique_chats) {
        const div = document.createElement("div");
        div.classList.add("chat-card");
        // text
        const sender = document.createElement("button");
        sender.textContent = `Sender: ${x}`;
        sender.id = x;

        sender.addEventListener("click", function () {
            message_in_a_chat(user_id, this.id);
        });

        div.appendChild(sender);

        document.getElementById("chat_list").appendChild(div);
    }

};

//output messages in chat box
async function message_in_a_chat(user_id, sender_id) {
    console.log(sender_id);
    console.log(user_id);
    const url = `https://cn483.brighton.domains/soundshare/src/server/api.php?sender=${sender_id}&receiver=${user_id}`;

    try {

        const response = await fetch(url);
        const text = await response.text();
        console.log(text);
        const obj = JSON.parse(text);
        

        const chatBox = document.getElementById("chat");
        chatBox.innerHTML = "";

        for (const item of obj.chat) {

            const next_message = document.createElement("p");

            if (item.dm_chat_sender == sender_id) {
                next_message.classList.add("sent");
            } else {
                next_message.classList.add("received");
            }

            next_message.textContent = item.dm_chat_message;
            chatBox.appendChild(next_message);
        }

        // scroll to newest message
        chatBox.scrollTop = chatBox.scrollHeight;

    } catch (error) {
        console.log(error);
    }
}
