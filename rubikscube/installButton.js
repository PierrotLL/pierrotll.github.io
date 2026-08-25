onload = _=> {
	installButton = document.createElement("button");
	installButton.innerHTML = "&#128242; Install";
	installButton.style = "display:none; position:absolute; top:0; right:0; margin:1em; opacity:0; transition:1s;";
	document.body.append(installButton);
	
	addEventListener("beforeinstallprompt", e=> {
		installButton.style.display = "";
		requestFrameAnimation(_=> installButton.style.opacity = 1);
		installButton.onclick = e.prompt();
	});
}