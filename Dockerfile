# Dockerfile final - SOLUTION QUI FONCTIONNE
FROM node:18-alpine

# Installation des dépendances système CRITIQUES pour la musique
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    py3-pip \
    make \
    g++ \
    git \
    opus \
    opus-dev \
    libsodium \
    libsodium-dev \
    pkgconfig \
    curl \
    wget

# ===== SOLUTION ALTERNATIVE : Installation directe de yt-dlp depuis GitHub =====
# Cette méthode évite complètement pip et les restrictions Python
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

# ===== ALTERNATIVE 2 : Si curl ne marche pas, utiliser wget =====
# RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp
# RUN chmod a+rx /usr/local/bin/yt-dlp

# ===== ALTERNATIVE 3 : Forcer pip avec toutes les options =====
# RUN python3 -m pip install --upgrade pip --break-system-packages --no-cache-dir --force-reinstall || true
# RUN python3 -m pip install yt-dlp --break-system-packages --no-cache-dir --force-reinstall || true

# Vérifications que les binaires sont installés
RUN ffmpeg -version
RUN yt-dlp --version

# Répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances Node.js
RUN npm ci --only=production

# Rebuild des modules natifs (important pour Discord.js voice)
RUN npm rebuild

# Copie du code source
COPY . .

# Création du dossier data
RUN mkdir -p /app/data

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000
ENV FFMPEG_PATH=/usr/bin/ffmpeg
ENV YTDL_PATH=/usr/local/bin/yt-dlp

# Port exposé
EXPOSE 3000

# Test final des dépendances
RUN echo "=== VÉRIFICATION FINALE ==="
RUN echo "✅ FFmpeg:" && ffmpeg -version | head -1
RUN echo "✅ yt-dlp:" && yt-dlp --version
RUN echo "✅ Node:" && node --version
RUN echo "✅ NPM:" && npm --version
RUN echo "✅ Répertoire:" && pwd && ls -la

# Commande de démarrage
CMD ["node", "index.js"]