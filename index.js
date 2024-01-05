const firebaseConfig = {
    apiKey: "AIzaSyD0h7EGj6jPXWBYBeWpiCj1GPB_TaXYYsA",
    authDomain: "zamorittachat.firebaseapp.com",
    databaseURL: "https://zamorittachat-default-rtdb.firebaseio.com/",
    projectId: "zamorittachat",
    storageBucket: "zamorittachat.appspot.com",
    messagingSenderId: "302736569310",
    appId: "1:302736569310:web:d9bb5b704955878628634f",
    measurementId: "G-BJ19PJS70Y"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// initialize database
const db = firebase.database();

// get user's data
const username = prompt("Please Tell Us Your Name");

// submit form
// listen for submit event on the form and call the postChat function
document.getElementById("message-form").addEventListener("submit", sendMessage);

// send message to db
async function sendMessage(e) {
    e.preventDefault();

    // get values to be submitted
    const timestamp = Date.now();
    const messageInput = document.getElementById("message-input");
    const file = document.querySelector('#file-input').files[0];
    console.log("FILE", file)
    console.log(file.type)
    console.log(file.name)

    const message = messageInput.value;

    let resultFile = {}
    if (file) {
        resultFile.name = file.name
        resultFile.type = file.type
        try {
            resultFile.content = await toBase64(file);
            // return result
        } catch (error) {
            console.error(error);
            return;
        }
    }

    console.log(resultFile)
    // clear the input box
    messageInput.value = "";
    file.value="";

    //auto scroll to bottom
    document
        .getElementById("messages")
        .scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });

    // create db collection and send in the data
    if (message && !file)
        db.ref("messages/" + timestamp).set({
            username,
            message,
        });
    else {
        db.ref("messages/" + timestamp).set({
            username,
            message,
            resultFile
        });
    }
}

// display the messages
// reference the collection created earlier
const fetchChat = db.ref("messages/");

// check for new messages using the onChildAdded event listener
fetchChat.on("child_added", function (snapshot) {
    const messages = snapshot.val();
    console.log(messages)
    const fileHTML = `
    <div>
    <object
    data=${messages?.resultFile?.content}
    type=${messages?.resultFile?.type}
    width="100%"
    height="500px"
  >
    </div>
    `
    const imgHTML = `
    <div> <img src=${messages?.resultFile?.content} alt="Red dot"  style="object-fit:cover; width:200px; height:200px;"/>
    <h4>${messages?.resultFile?.name}</h4>
    </div>`
    const message = `<li class=${username === messages.username ? "sent" : "receive"
        }><span>${messages.username}: </span>${messages.message}
        ${messages?.resultFile?.type == "application/pdf"
            ? fileHTML
            : messages.resultFile?.type.includes("image")
                ? imgHTML
                : ""
        }
        </li>
        `;
    // append the message on the page
    document.getElementById("messages").innerHTML += message;
});





const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});