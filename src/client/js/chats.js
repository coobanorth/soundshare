window.addEventListener('load', function () {
    let user_id = 1;

    const js_display_id = document.getElementById("display_id");
    js_display_id.textContent = "User ID: " + user_id;


    all_chats();

});

async function all_chats() {
    const url = 'https://cn483.brighton.domains/soundshare/src/server/api.php?chat=all';

    try {

        const response = await fetch(url);
        const text = await response.text();
        const obj = JSON.parse(text);

        for (const item of obj.chat) {

const dm_chat_id = item.dm_chat_id;
const dm_chat_sender = item.dm_chat_sender;
const dm_chat_receiver = item.dm_chat_receiver;
const dm_chat_message = item.dm_chat_message;
const dm_chat_timestamp = item.dm_chat_timestamp;

            const div = document.createElement("div");
            div.classList.add("chat-card");

            // text
            const id = document.createElement("p");
            id.textContent = `Time Of chat: ${dm_chat_id}`;

            const sender = document.createElement("p");
            sender.textContent = `Sender: ${dm_chat_sender}`;

            const receiver = document.createElement("p");
            receiver.textContent = `Receiver: ${dm_chat_receiver}`;

            const message = document.createElement("p");
            message.textContent = `Message: ${dm_chat_message}`;

            const time = document.createElement("p");
            time.textContent = `Time: ${dm_chat_timestamp}`;

            div.appendChild(id);
            div.appendChild(sender);
            div.appendChild(receiver);
            div.appendChild(message);
            div.appendChild(time);

            document.getElementById("chat_list").appendChild(div);
        }

    } catch (error) {
        console.log(error);
    }
};
