const express = require("express");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn } = require("child_process");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

function isValidYouTubeUrl(value) {
    try {
        const url = new URL(value);

        const allowedHosts = new Set([
            "youtube.com",
            "www.youtube.com",
            "m.youtube.com",
            "music.youtube.com",
            "youtu.be"
        ]);

        return allowedHosts.has(url.hostname);
    } catch {
        return false;
    }
}

function sanitizeFilename(filename) {
    return filename
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 150);
}

function removeFolder(folderPath) {
    fs.rm(folderPath, {
        recursive: true,
        force: true
    }, error => {
        if (error) {
            console.error("Erro ao limpar pasta temporária:", error.message);
        }
    });
}

app.post("/download", async (req, res) => {
    const { url, quality = "192" } = req.body || {};

    const allowedQualities = new Set(["128", "192", "320"]);

    if (!url || typeof url !== "string") {
        return res.status(400).json({
            error: "Informe o link do vídeo."
        });
    }

    if (!isValidYouTubeUrl(url)) {
        return res.status(400).json({
            error: "Informe um link válido do YouTube."
        });
    }

    if (!allowedQualities.has(String(quality))) {
        return res.status(400).json({
            error: "Qualidade de áudio inválida."
        });
    }

    const jobId = crypto.randomUUID();
    const temporaryFolder = path.join(
        os.tmpdir(),
        `youtube-mp3-${jobId}`
    );

    fs.mkdirSync(temporaryFolder, {
        recursive: true
    });

    const outputTemplate = path.join(
        temporaryFolder,
        "%(title).150B-%(id)s.%(ext)s"
    );

    const argumentsList = [
        "--no-playlist",
        "--no-warnings",
        "--restrict-filenames",
        "--extract-audio",
        "--audio-format",
        "mp3",
        "--audio-quality",
        `${quality}K`,
        "--output",
        outputTemplate,
        url
    ];

    const downloader = spawn("yt-dlp", argumentsList, {
        windowsHide: true
    });

    let errorOutput = "";
    let requestFinished = false;

    const timeout = setTimeout(() => {
        if (!requestFinished) {
            downloader.kill("SIGTERM");
        }
    }, 10 * 60 * 1000);

    downloader.stderr.on("data", data => {
        errorOutput += data.toString();
    });

    downloader.on("error", error => {
        clearTimeout(timeout);
        requestFinished = true;
        removeFolder(temporaryFolder);

        if (error.code === "ENOENT") {
            return res.status(500).json({
                error:
                    "O yt-dlp não foi encontrado. Instale o yt-dlp e reinicie o servidor."
            });
        }

        return res.status(500).json({
            error: "Não foi possível iniciar a conversão."
        });
    });

    downloader.on("close", exitCode => {
        clearTimeout(timeout);

        if (requestFinished) {
            return;
        }

        requestFinished = true;

        if (exitCode !== 0) {
            console.error("Erro do yt-dlp:", errorOutput);

            removeFolder(temporaryFolder);

            return res.status(500).json({
                error:
                    "Não foi possível baixar o vídeo. Confirme se ele está disponível e se você possui acesso."
            });
        }

        const files = fs.readdirSync(temporaryFolder);

        const mp3File = files.find(file =>
            file.toLowerCase().endsWith(".mp3")
        );

        if (!mp3File) {
            removeFolder(temporaryFolder);

            return res.status(500).json({
                error: "O arquivo MP3 não foi gerado."
            });
        }

        const completePath = path.join(
            temporaryFolder,
            mp3File
        );

        const downloadName =
            sanitizeFilename(mp3File) || "audio.mp3";

        res.download(
            completePath,
            downloadName,
            error => {
                removeFolder(temporaryFolder);

                if (error && !res.headersSent) {
                    res.status(500).json({
                        error: "Erro ao enviar o arquivo MP3."
                    });
                }
            }
        );
    });

    req.on("close", () => {
        if (!requestFinished && !res.writableEnded) {
            downloader.kill("SIGTERM");
            removeFolder(temporaryFolder);
        }
    });
});

app.use((req, res) => {
    res.status(404).json({
        error: "Rota não encontrada."
    });
});

app.listen(PORT, () => {
    console.log(`Servidor funcionando em http://localhost:${PORT}`);
});