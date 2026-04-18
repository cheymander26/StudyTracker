const form = document.getElementById("question-form");
const questionInput = document.getElementById("question");
const categoryInput = document.getElementById("category");
const difficultyInput = document.getElementById("difficulty");
const statusInput = document.getElementById("status");

const questionsList = document.getElementById("questions-list");

const totalCount = document.getElementById("question-count");
const practicingCount = document.getElementById("practicing-count");
const masteredCount = document.getElementById("mastered-count");
const averageTime = document.getElementById("average-time");
const totalTime = document.getElementById("total-time");
const bestStreak = document.getElementById("streak");
const lastPracticed = document.getElementById("last-practiced");

const searchInput = document.getElementById("search-input");
const filterCategory = document.getElementById("filter-category");
const filterStatus = document.getElementById("filter-status");

const generateTestBtn = document.getElementById("generate-test-btn");
const testDurationSelect = document.getElementById("test-duration");
const testCountSelect = document.getElementById("test-count");
const testQuestionsContainer = document.getElementById("test-questions");
const testQuestionTotal = document.getElementById("test-question-total");
const timeLeftDisplay = document.getElementById("time-left");

let currentTestQuestions = [];
let testTimer = null;
let timeRemaining = 0;

let questions = JSON.parse(localStorage.getItem("devtrackQuestions")) || [];

function saveQuestions() {
    localStorage.setItem("devtrackQuestions", JSON.stringify(questions));
}

function shuffleArray(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

function updateStats() {
    totalCount.textContent = questions.length;
    practicingCount.textContent = questions.filter(
        (q) => q.status === "Practicing"
    ).length;
    masteredCount.textContent = questions.filter(
        (q) => q.status === "Mastered"
    ).length;

    totalTime.textContent = `${questions.length * 5} min`;
    averageTime.textContent = questions.length > 0 ? "5 min" : "0 min";
    bestStreak.textContent = questions.filter(
        (q) => q.status === "Mastered"
    ).length;
    lastPracticed.textContent = questions.length > 0 ? "Today" : "Never";
}

function renderQuestions() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = filterCategory.value;
    const selectedStatus = filterStatus.value;

    const filteredQuestions = questions.filter((question) => {
        const matchesSearch = question.text.toLowerCase().includes(searchTerm);
        const matchesCategory =
            selectedCategory === "All" || question.category === selectedCategory;
        const matchesStatus =
            selectedStatus === "All" || question.status === selectedStatus;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    questionsList.innerHTML = "";

    if (filteredQuestions.length === 0) {
        questionsList.innerHTML =
            '<p class="empty-message">No results found.</p>';
        updateStats();
        return;
    }

    filteredQuestions.forEach((question) => {
        const card = document.createElement("div");
        card.classList.add("question-card");

        card.innerHTML = `
            <h3>${question.text}</h3>
            <div class="meta">
                <span class="badge">${question.category}</span>
                <span class="badge">${question.difficulty}</span>
                <span class="badge">${question.status}</span>
            </div>
            <div class="actions">
                <button class="master-btn" data-id="${question.id}">Mastered</button>
                <button class="delete-btn" data-id="${question.id}">Delete</button>
            </div>
        `;

        questionsList.appendChild(card);
    });

    updateStats();
}

function addQuestion(event) {
    event.preventDefault();

    const text = questionInput.value.trim();

    if (!text) {
        return;
    }

    const newQuestion = {
        id: Date.now(),
        text,
        category: categoryInput.value,
        difficulty: difficultyInput.value,
        status: statusInput.value,
    };

    questions.push(newQuestion);
    saveQuestions();
    renderQuestions();
    form.reset();
}

function deleteQuestion(id) {
    questions = questions.filter((question) => question.id !== id);
    saveQuestions();
    renderQuestions();
}

function markMastered(id) {
    questions = questions.map((question) =>
        question.id === id
            ? { ...question, status: "Mastered" }
            : question
    );

    saveQuestions();
    renderQuestions();
}

function renderTestQuestions() {
    testQuestionsContainer.innerHTML = "";
    testQuestionTotal.textContent = currentTestQuestions.length;

    currentTestQuestions.forEach((question, index) => {
        const card = document.createElement("div");
        card.classList.add("test-question-card");

        card.innerHTML = `
            <h4>Question ${index + 1}</h4>
            <p>${question.text}</p>
            <div class="meta">
                <span class="badge">${question.category}</span>
                <span class="badge">${question.difficulty}</span>
                <span class="badge">${question.status}</span>
            </div>
        `;

        testQuestionsContainer.appendChild(card);
    });
}

function updateTimerDisplay() {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;

    timeLeftDisplay.textContent = `${String(mins).padStart(2, "0")}:${String(
        secs
    ).padStart(2, "0")}`;
}

function startTestTimer(minutes) {
    clearInterval(testTimer);

    timeRemaining = minutes * 60;
    updateTimerDisplay();

    testTimer = setInterval(() => {
        timeRemaining--;

        if (timeRemaining <= 0) {
            clearInterval(testTimer);
            timeRemaining = 0;
            updateTimerDisplay();
            alert("Time is up!");
            return;
        }

        updateTimerDisplay();
    }, 1000);
}

function generateRandomTest() {
    if (questions.length === 0) {
        testQuestionsContainer.innerHTML =
            '<p class="empty-message">Add some questions first.</p>';
        testQuestionTotal.textContent = "0";
        timeLeftDisplay.textContent = "--:--";
        return;
    }

    const requestedCount = Number(testCountSelect.value);
    const shuffled = shuffleArray(questions);

    currentTestQuestions = shuffled.slice(
        0,
        Math.min(requestedCount, questions.length)
    );

    renderTestQuestions();
    startTestTimer(Number(testDurationSelect.value));
}

form.addEventListener("submit", addQuestion);
searchInput.addEventListener("input", renderQuestions);
filterCategory.addEventListener("change", renderQuestions);
filterStatus.addEventListener("change", renderQuestions);
generateTestBtn.addEventListener("click", generateRandomTest);

questionsList.addEventListener("click", (event) => {
    const id = Number(event.target.dataset.id);

    if (event.target.classList.contains("delete-btn")) {
        deleteQuestion(id);
    }

    if (event.target.classList.contains("master-btn")) {
        markMastered(id);
    }
});

renderQuestions();
updateTimerDisplay();