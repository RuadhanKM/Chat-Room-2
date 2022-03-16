var connected = false
const ta = document.getElementById("main-ta")
const sub = document.getElementById("main-sub")

function updateButtonsEnabled() {
	ta.disabled = !connected
	sub.disabled = !connected
}

function ev(e) {
	e.preventDefault()
}
function _arrayBufferToBase64( buffer ) {
	var binary = '';
	var bytes = new Uint8Array( buffer );
	var len = bytes.byteLength;
	for (var i = 0; i < len; i++) {
		binary += String.fromCharCode( bytes[ i ] );
	}
	return window.btoa( binary );
}

function connect() {
	const ws = new WebSocket('ws://'+window.location.hostname+":8080")
	
	function handleFileDrop(ev){
		ev.preventDefault()
		if (ev.dataTransfer.items) {
			for (var i = 0; i < ev.dataTransfer.items.length; i++) {
				if (ev.dataTransfer.items[i].kind === 'file') {
					var file = ev.dataTransfer.items[i].getAsFile();

					let fileReader = new FileReader()
					
					fileReader.onload = function (e) {
						ws.send(JSON.stringify([localStorage.getItem("name"), e.target.result, file.name]))
					}
					
					let data = fileReader.readAsDataURL(file)
				}
			}
		}
	}
	function submitMessage() {
		if (!localStorage.getItem("name")) {window.location.replace("/chat")}
		
		var message = ta.value
		if (message == "") {return}
		if (message[0] == "/" && message[1] != "/") {
			handleClientCommands(message.slice(1))
		} else {
			ws.send(JSON.stringify([localStorage.getItem("name"), message]))
		}
		ta.value = ""
	}
	
	document.getElementById("main-mes").addEventListener('drop', handleFileDrop)
	document.getElementById("main-mes").addEventListener('dragover', ev)
	
	ws.addEventListener('open', function (event) {
		addMessage("Connected to server!", "green", true)
		connected = true
		
		ws.send(JSON.stringify([localStorage.getItem("name")]))
		
		updateButtonsEnabled()
		
		sub.onclick = submitMessage
		ta.onkeydown = function(e){
			if (e.keyCode == 13 && !e.shiftKey) {
				submitMessage()
				e.preventDefault()
			}
		}
	})

	ws.addEventListener('message', function (event) {
		var parsedData = JSON.parse(event.data)
		var message = parsedData.mes
		var users = parsedData.onl
		
		if (message) {
			addMessage(message[0] + ": " + message[1], message[2])
		}
		
		if (users) {
			document.getElementById("main-onl").innerHTML = ""
			for (const user of users) {
				var userDiv = document.createElement("div")
				userDiv.className = "user"
				userDiv.style.backgroundColor = user.color
				userDiv.id = user.color
				userDiv.innerHTML = user.name

				document.getElementById("main-onl").appendChild(userDiv)
			}
			document.getElementById("title").innerHTML = "HMG Chat Room [" + users.length + "]"
		}
		
		if (parsedData.server_error) {
			addMessage(parsedData.server_error, "red", true)
		}
	})

	ws.addEventListener('close', function (event) {
		if (connected) {
			document.getElementById("main-onl").innerHTML = ""
			addMessage("Disconnected from server!", "red", true)
			connected = false
			updateButtonsEnabled()
		}
		
		setTimeout(function(){
			addMessage("Attempting to connect to server...", "yellow", true)
			connect()
		}, 1000)
	})
}

if (localStorage.getItem("name")) {connect()} else {
	window.location.replace("/chat")
}