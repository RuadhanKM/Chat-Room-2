function addMessage(text, color, error=false) {
	var messageSpan = document.createElement("div")
	messageSpan.className = error ? "error-mes" : "mes"
	messageSpan.style.backgroundColor = color
	messageSpan.id = color
	messageSpan.innerHTML = text

	var mm = document.getElementById("main-mes")
	
	mm.insertBefore(messageSpan, mm.firstChild)
}

function handleClientCommands(command) {
	const parsedCommand = command.split(" ")
	
	if (parsedCommand[0] == "clear") {
		document.getElementById("main-mes").innerHTML = ""
	}
	if (parsedCommand[0] == "clear_name") {
		localStorage.removeItem("name")
		window.location.replace("/")
	}
}