function showData()
{
	if (request.readyState == 4 && request.status == 200) {
		str_data = request.responseText;

		data = JSON.parse(str_data);

		html_data = "\n";
		for (i in data) { // Doesn't do what I'd expect
			next_p = "\t\t<p id=\"" + data[i]["id"] + "\">"
				   + data[i]["username"] + ": "
				   + data[i]["content"] + "</p>\n";
			html_data += next_p;
		}
		html_data += "\t";

		document.getElementById("messages").innerHTML = html_data;
	}
}

function parse()
{
	request = new XMLHttpRequest;

	request.open("GET", "http://messagehub.herokuapp.com/messages.json", true);

	request.onreadystatechange = showData;

	request.send()
}