(_=>{
	if (matchMedia('(display-mode: standalone)').matches) return;
	installButton = document.createElement("button");
	installButton.setAttribute("id", "installButton");
	installButton.innerHTML = "&#128242; Install";
	installButton.style = "position:absolute; top:0; right:0; font-size: 16px; padding:8px 16px; margin:1em; opacity:0; transition:1s; ";
	let installPromptEvent;
	addEventListener("beforeinstallprompt", e=> {
		installPromptEvent = e;
		document.body.append(installButton);
		requestAnimationFrame(_=> installButton.style.opacity = 1);
	});
	installButton.onclick = (_=>{
		installPromptEvent.prompt().then(value => {
			if (value.outcome == "accepted") installButton.remove();
		});
	});
})();