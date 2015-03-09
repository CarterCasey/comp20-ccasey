function showData()
{
	console.log("Ready State: " + request.readyState);

	if (request.readyState == 4 && request.status == 400) {
		str_data = request.responseText;

		data = JSON.parse(str_data);

		html_data = ""
		for (i in data) { // Doesn't do what I'd expect
			next_p = "<p id=\"" + data[i]["id"] + "\"> "
				   + data[i]["username"] + ": "
				   + data[i]["content"] + " </p>\n";
			html_data += next_p;
		}

		document.getElementById("messages").innerHTML = html_data;
	}
}

function parse()
{
	request = new XMLHttpRequest;

	request.open("GET", "data.json", true);

	request.onreadystatechange = showData;

	request.send()
}