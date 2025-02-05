function showTab(tabName) {
    document.getElementById('polls').style.display = tabName === 'polls' ? 'block' : 'none';
    document.getElementById('discussions').style.display = tabName === 'discussions' ? 'block' : 'none';
}
const pollList = document.getElementById('pollList');
const discussionList = document.getElementById('discussionList');

function createPoll() {
    const question = document.getElementById('question').value;
    const option1 = document.getElementById('option1').value;
    const option2 = document.getElementById('option2').value;
    
    if (!question || !option1 || !option2) {
        alert('Please fill all fields');
        return;
    }
    
    const pollElement = document.createElement('div');
    pollElement.classList.add('poll');
    pollElement.innerHTML = `
        <h3>${question}</h3>
        <button onclick="vote(this)">${option1} (0)</button>
        <button onclick="vote(this)">${option2} (0)</button>
    `;
    pollList.appendChild(pollElement);
}

function vote(button) {
    let count = parseInt(button.textContent.match(/\d+/)[0]) + 1;
    button.textContent = button.textContent.replace(/\d+/, count);
}

function createDiscussion() {
    const topic = document.getElementById('discussionTopic').value;
    const content = document.getElementById('discussionContent').value;
    
    if (!topic || !content) {
        alert('Please fill all fields');
        return;
    }
    
    const discussionElement = document.createElement('div');
    discussionElement.classList.add('discussion');
    discussionElement.innerHTML = `
        <h3>${topic}</h3>
        <p>${content}</p>
    `;
    discussionList.appendChild(discussionElement);
}
