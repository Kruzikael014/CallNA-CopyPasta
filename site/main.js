function copyMessage(message) {
    navigator.clipboard.writeText(message)
        .then(() => {
            alert('Message copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy:', err);
        });
}

async function fetchMessage() {
    try {
        const response = await fetch('http://103.175.217.115:6969/messages');
        const result = await response.json();
        if (result.isSuccess) {
            return result.obj;
        } else {
            alert(result.error)
        }
    } catch (error) {
        alert(error)
    }
}

async function deleteMessage(messageId) {
    try {
        const response = await fetch(`http://103.175.217.115:6969/messages/${messageId}`, {
            method: 'DELETE'
        });
        const result = await response.json()

        if (result.isSuccess) {
            alert('Message has been deleted!')
        } else {
            console.log(result);
            alert('Failed to delete message!');
        }
        window.location.reload()
    } catch (error) {
        alert('Failed to delete message!');
    }
}

async function addMessage() {
    const messageContent = prompt('Enter the message content:');
    if (messageContent) {
        try {
            const response = await fetch('http://103.175.217.115:6969/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: messageContent })
            });
            const result = await response.json()

            if (result.isSuccess) {
                alert('Message successfully added!')
            } else {
                alert('Failed to add message!');
            }
            window.location.reload()
        } catch (error) {
            console.log(error);
            alert('Failed to add message!');
        }
    }
}

window.onload = async function () {
    const messages = await fetchMessage();

    if (messages) {
        const messageContainer = document.getElementById('message-container');
        // messageContainer.innerHTML = '';  // Clear existing messages (if needed)

        messages.forEach(message => {
            const messageBoxHTML = `
            <div class="message-box" id="message-${message.message_id}">
                <button class="copy-btn" onclick="copyMessage('${message.content}')">📋</button>
                <button class="delete-btn" onclick="deleteMessage('${message.message_id}')">🗑️</button>
                <p>${message.content}</p>
            </div>`;
            messageContainer.innerHTML += messageBoxHTML;
        });
    }
}
