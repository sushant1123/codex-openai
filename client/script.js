import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const prompt = document.getElementById("prompt");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

function loader(element) {
	element.textContent = "";
	loadInterval = setInterval(() => {
		element.textContent += ".";

		if (element.textContent === "....") {
			element.textContent = "";
		}
	}, 300);
}

function typeText(element, text) {
	let index = 0;

	let interval = setInterval(() => {
		if (index < text.length) {
			element.innerHTML += text.charAt(index);
			index++;
		} else {
			clearInterval(interval);
		}
	}, 30);
}

function generateId() {
	const timeStamp = Date.now();
	const randomNumber = Math.random();
	const hexaDecimalString = randomNumber.toString(16);

	return `id-${timeStamp}-${hexaDecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
	return `
        <div class="wrapper ${isAi && "ai"}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? "bot" : "user"}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
}

const handleSubmit = async (event) => {
	event.preventDefault();

	const data = new FormData(form);
	const promptData = data.get("prompt").trim();
	if (promptData.length === 0) {
		alert("Please enter something to search..");
		return;
	}

	//user chatstripe
	chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
	form.reset();

	//bot chatstripe
	const uniqueId = generateId();
	chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

	chatContainer.scrollTop = chatContainer.scrollHeight;

	const messageDiv = document.getElementById(uniqueId);

	loader(messageDiv);

	// fetch data from server
	const response = await fetch("http://localhost:5000/", {
		method: "post",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt: data.get("prompt"),
		}),
	});

	clearInterval(loadInterval);
	messageDiv.innerHTML = "";

	if (response.ok) {
		const data = await response.json();
		const parseData = data.bot.trim();

		typeText(messageDiv, parseData);
	} else {
		const err = await response.text();
		messageDiv.innerText = "Something went wrong";
		alert(err);
	}
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
	if (e.key == "Enter") {
		e.preventDefault();
		handleSubmit(e);
	}
});
prompt.addEventListener("keydown", (e) => {
	// Enter was pressed without shift key
	if (e.key == "Enter" && !e.shiftKey) {
		// prevent default behavior
		e.preventDefault();
	}
});
