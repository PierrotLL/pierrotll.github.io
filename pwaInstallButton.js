function isRunningStandalone() {
    return matchMedia('(display-mode: standalone)').matches;
}

onload = _=> {
	if (isRunningStandalone()) return;
	installButton = document.createElement("button");
	installButton.setAttribute("id", "installButton");
	installButton.innerHTML = "&#128242; Install";
	installButton.style = "position:absolute; top:0; right:0; margin:1em; opacity:0; transition:1s;";
	
	addEventListener("beforeinstallprompt", e=> {
		document.body.append(installButton);
		requestAnimationFrame(_=> installButton.style.opacity = 1);
		installButton.onclick = _=> {
			e.prompt().then(value => {
				if (value == "accepted") installButton.remove();
			});
		};
	});
}