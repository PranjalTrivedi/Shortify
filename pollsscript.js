import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { get, getDatabase, onValue, push, ref, remove, update } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBTCAYvkaKFAsRdnQewEqd8gexgU-O89h0",
    authDomain: "info-6134-pos-shortify.firebaseapp.com",
    databaseURL: "https://info-6134-pos-shortify-default-rtdb.firebaseio.com",
    projectId: "info-6134-pos-shortify",
    storageBucket: "info-6134-pos-shortify.appspot.com",
    messagingSenderId: "702241263195",
    appId: "1:702241263195:web:c8263d2aac4fdc69a9f97e",
    measurementId: "G-W8FZD2RG9V"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const pollList = document.getElementById("pollList");
const discussionList = document.getElementById("discussionList");

function showTab(tabName) {
    document.getElementById("polls").style.display = "none";
    document.getElementById("discussions").style.display = "none";
    document.getElementById(tabName).style.display = "block";
}

window.showTab = showTab;

document.addEventListener("DOMContentLoaded", () => {
    const addOptionBtn = document.getElementById("addOptionBtn");
    const optionsContainer = document.getElementById("options-container");

    addOptionBtn.addEventListener("click", () => {
        const optionInput = document.createElement("input");
        optionInput.type = "text";
        optionInput.className = "option";
        optionInput.placeholder = `Option ${optionsContainer.children.length + 1}`;
        optionsContainer.appendChild(optionInput);
    });

    document.getElementById("createPollBtn").addEventListener("click", createPoll);
    document.getElementById("createDiscussionBtn").addEventListener("click", createDiscussion);
    
    fetchPolls();
    fetchDiscussions();
});

function createPoll() {
    const question = document.getElementById("question").value.trim();
    const options = Array.from(document.querySelectorAll(".option")).map(option => option.value.trim());

    if (!question || options.some(option => !option)) {
        alert("Please fill all fields!");
        return;
    }

    const pollRef = ref(db, "polls");
    const optionsObject = options.reduce((acc, option) => {
        acc[option] = 0; 
        return acc;
    }, {});

    push(pollRef, {
        question,
        options: optionsObject
    }).then(() => {
        document.getElementById("question").value = "";
        document.querySelectorAll(".option").forEach(option => option.value = "");
    }).catch(error => console.error("Error creating poll:", error));
}

window.vote = function (pollKey, option) {
    const pollRef = ref(db, `polls/${pollKey}/options/${option}`);

    get(pollRef).then(snapshot => {
        if (snapshot.exists()) {
            const currentVotes = snapshot.val();
            update(ref(db, `polls/${pollKey}/options`), {
                [option]: currentVotes + 1
            });
        }
    }).catch(error => console.error("Error voting:", error));
};

window.deletePoll = function (pollKey) {
    if (confirm("Are you sure you want to delete this poll?")) {
        remove(ref(db, `polls/${pollKey}`)).catch(error => console.error("Error deleting poll:", error));
    }
};

window.deleteDiscussion = function (discussionKey) {
    if (confirm("Are you sure you want to delete this discussion?")) {
        remove(ref(db, `discussions/${discussionKey}`)).catch(error => console.error("Error deleting discussion:", error));
    }
};

function fetchPolls() {
    const pollRef = ref(db, "polls");
    onValue(pollRef, snapshot => {
        pollList.innerHTML = "";
        if (!snapshot.exists()) {
            pollList.innerHTML = "<p>No polls available.</p>";
            return;
        }
        snapshot.forEach(childSnapshot => {
            const poll = childSnapshot.val();
            const pollKey = childSnapshot.key;
            const pollElement = document.createElement("div");
            pollElement.classList.add("poll");
            pollElement.innerHTML = `
                <h3>${poll.question}</h3>
                ${Object.keys(poll.options).map(option => `
                    <button onclick="vote('${pollKey}', '${option}')">
                        ${option} (${poll.options[option]})
                    </button>
                `).join("")}
                <button onclick="deletePoll('${pollKey}')" style="float: right; background-color: darkred; color: white; border: none; padding: 5px 10px; cursor: pointer;">Delete</button>
            `;
            pollList.appendChild(pollElement);
        });
    }, error => console.error("Error fetching polls:", error));
}

function createDiscussion() {
    const topic = document.getElementById("discussionTopic").value.trim();
    const content = document.getElementById("discussionContent").value.trim();

    if (!topic || !content) {
        alert("Please fill all fields!");
        return;
    }

    const discussionRef = ref(db, "discussions");
    push(discussionRef, { topic, content })
    .then(() => {
        document.getElementById("discussionTopic").value = "";
        document.getElementById("discussionContent").value = "";
    })
    .catch(error => console.error("Error creating discussion:", error));
}

function fetchDiscussions() {
    const discussionRef = ref(db, "discussions");
    onValue(discussionRef, snapshot => {
        discussionList.innerHTML = "";
        if (!snapshot.exists()) {
            discussionList.innerHTML = "<p>No discussions available.</p>";
            return;
        }
        snapshot.forEach(childSnapshot => {
            const discussion = childSnapshot.val();
            const discussionKey = childSnapshot.key;
            const discussionElement = document.createElement("div");
            discussionElement.classList.add("discussion");
            discussionElement.innerHTML = `
                <h3>${discussion.topic}</h3>
                <p>${discussion.content}</p>
                <button onclick="deleteDiscussion('${discussionKey}')" style="float: right; background-color: darkred; color: white; border: none; padding: 5px 10px; cursor: pointer;">Delete</button>
            `;
            discussionList.appendChild(discussionElement);
        });
    }, error => console.error("Error fetching discussions:", error));
}
