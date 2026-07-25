const urlInput = document.getElementById("url");
const qualitySelect = document.getElementById("quality");
const statusElement = document.getElementById("status");
const downloadButton = document.querySelector("button");

function isValidYouTubeUrl(url) {
    try {
        const parsedUrl = new URL(url);

        const allowedHosts = [
            "youtube.com",
            "www.youtube.com",
            "m.youtube.com",
            "youtu.be"
        ];

        return allowedHosts.includes(parsedUrl.hostname);
    } catch {
        return false;
    }
}

async function downloadMp3() {
    const url = urlInput.value.trim();
    const quality = qualitySelect.value;

    if (!url) {
        statusElement.textContent = "Cole o link de um vídeo do YouTube.";
        statusElement.className = "error";
        return;
    }

    if (!isValidYouTubeUrl(url)) {
        statusElement.textContent = "Digite um link válido do YouTube.";
        statusElement.className = "error";
        return;
    }

    downloadButton.disabled = true;
    statusElement.textContent = "Preparando o áudio...";
    statusElement.className = "loading";

    try {
        const response = await fetch("/download", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                url,
                quality
            })
        });

        if (!response.ok) {
            let message = "Não foi possível converter o vídeo.";

            try {
                const errorData = await response.json();

                if (errorData.error) {
                    message = errorData.error;
                }
            } catch {
                // Mantém a mensagem padrão.
            }

            throw new Error(message);
        }

        const audioBlob = await response.blob();

        const disposition = response.headers.get("Content-Disposition");
        let filename = "audio.mp3";

        if (disposition) {
            const filenameMatch = disposition.match(
                /filename\*?=(?:UTF-8'')?["']?([^"';]+)/
            );

            if (filenameMatch?.[1]) {
                filename = decodeURIComponent(filenameMatch[1]);
            }
        }

        const temporaryUrl = URL.createObjectURL(audioBlob);
        const downloadLink = document.createElement("a");

        downloadLink.href = temporaryUrl;
        downloadLink.download = filename;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        URL.revokeObjectURL(temporaryUrl);

        statusElement.textContent = "Download iniciado com sucesso.";
        statusElement.className = "success";
    } catch (error) {
        statusElement.textContent =
            error.message || "Ocorreu um erro durante o download.";

        statusElement.className = "error";
    } finally {
        downloadButton.disabled = false;
    }
}

urlInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        downloadMp3();
    }
});