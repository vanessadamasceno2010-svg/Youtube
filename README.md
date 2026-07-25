# YouTube MP3 Downloader

Projeto em Node.js para converter em MP3 vídeos do YouTube para os quais você possui autorização de download.

## Requisitos

- Node.js 18+
- FFmpeg instalado
- yt-dlp instalado

Verifique se estão instalados:

```bash
node -v
yt-dlp --version
ffmpeg -version
```

## Instalação

Instale as dependências do projeto:

```bash
npm install
```

## Executando

Inicie o servidor:

```bash
npm start
```

Abra o navegador:

```
http://localhost:3000
```

## Estrutura

```
youtube-mp3-local/
│
├── package.json
├── server.js
├── README.md
│
└── public/
    ├── index.html
    ├── style.css
    └── script.js
```

## Como utilizar

1. Abra a página no navegador.
2. Cole a URL do vídeo.
3. Escolha a qualidade do áudio.
4. Clique em **Baixar MP3**.
5. Aguarde o processamento.
6. O download do arquivo será iniciado automaticamente.

## Observações

- Utilize apenas para vídeos próprios ou conteúdos para os quais você tenha autorização para download.
- O tempo de processamento depende do tamanho do vídeo e da velocidade da conexão.

## Tecnologias

- Node.js
- Express
- yt-dlp
- FFmpeg
- HTML5
- CSS3
- JavaScript