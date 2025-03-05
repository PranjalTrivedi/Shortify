import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { get, getDatabase, onValue, push, ref, remove, update } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-database.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-messaging.js";

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
const messaging = getMessaging(app); 

const translations = {
    en: {
        welcome: "Shortify Poll",
        home: "Home",
        poll: "Poll",
        polls: "Polls",
        discussions: "Discussions",
        enterPoll: "Enter poll question",
        enterOption: "Option",
        addOption: "Add Option",
        createPoll: "Create Poll",
        enterDiscussion: "Enter discussion topic",
        enterContent: "Enter your discussion",
        startDiscussion: "Start Discussion",
        noPolls: "No polls available.",
        noDiscussions: "No discussions available."
    },
    es: {
        welcome: "Encuesta de Shortify",
        home: "Inicio",
        poll: "Encuesta",
        polls: "Encuestas",
        discussions: "Discusiones",
        enterPoll: "Ingrese la pregunta de la encuesta",
        enterOption: "Opción",
        addOption: "Agregar opción",
        createPoll: "Crear encuesta",
        enterDiscussion: "Ingrese el tema de discusión",
        enterContent: "Ingrese su discusión",
        startDiscussion: "Iniciar discusión",
        noPolls: "No hay encuestas disponibles.",
        noDiscussions: "No hay discusiones disponibles."
    },
    fr: {
        welcome: "Sondage Shortify",
        home: "Accueil",
        poll: "Sondage",
        polls: "Sondages",
        discussions: "Discussions",
        enterPoll: "Entrez la question du sondage",
        enterOption: "Option",
        addOption: "Ajouter une option",
        createPoll: "Créer un sondage",
        enterDiscussion: "Entrez le sujet de discussion",
        enterContent: "Entrez votre discussion",
        startDiscussion: "Démarrer la discussion",
        noPolls: "Aucun sondage disponible.",
        noDiscussions: "Aucune discussion disponible."
    }
};

// Function to update UI with selected language
function updateLanguage(lang) {
    document.getElementById("welcome").textContent = translations[lang].welcome;
    document.querySelector("nav a[href='index.html']").textContent = translations[lang].home;
    document.querySelector("nav a[href='pollsdiscussions.html']").textContent = translations[lang].poll;
    document.querySelector(".tabs button:nth-child(1)").textContent = translations[lang].polls;
    document.querySelector(".tabs button:nth-child(2)").textContent = translations[lang].discussions;
    document.getElementById("question").placeholder = translations[lang].enterPoll;
    document.querySelectorAll(".option").forEach((el, index) => el.placeholder = `${translations[lang].enterOption} ${index + 1}`);
    document.getElementById("addOptionBtn").textContent = translations[lang].addOption;
    document.getElementById("createPollBtn").textContent = translations[lang].createPoll;
    document.getElementById("discussionTopic").placeholder = translations[lang].enterDiscussion;
    document.getElementById("discussionContent").placeholder = translations[lang].enterContent;
    document.getElementById("createDiscussionBtn").textContent = translations[lang].startDiscussion;

    if (document.getElementById("pollList").innerHTML.includes("No polls available.")) {
        document.getElementById("pollList").innerHTML = `<p>${translations[lang].noPolls}</p>`;
    }

    if (document.getElementById("discussionList").innerHTML.includes("No discussions available.")) {
        document.getElementById("discussionList").innerHTML = `<p>${translations[lang].noDiscussions}</p>`;
    }
}

// Add event listener for language selection
document.getElementById("languageSelector").addEventListener("change", function () {
    updateLanguage(this.value);
});

// Initialize with default language
updateLanguage("en");


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
