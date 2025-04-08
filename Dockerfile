FROM node:22-slim
WORKDIR /app

# Set up locales
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NODE_ENV=production

RUN log() { echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1"; };

# Install the application dependencies
RUN \
  touch .env && \
  apt update && \
  apt install -y --no-install-recommends build-essential ca-certificates ffmpeg git locales mediainfo pipx python3 wget && \
  \
  sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen && \
  \
  update-ca-certificates && \
  \
  wget -O /etc/apt/keyrings/gpg-pub-moritzbunkus.gpg https://mkvtoolnix.download/gpg-pub-moritzbunkus.gpg && \
  echo "deb [signed-by=/etc/apt/keyrings/gpg-pub-moritzbunkus.gpg] https://mkvtoolnix.download/debian/ bookworm main" > /etc/apt/sources.list.d/mkvtoolnix.download.list && \
  \
  apt update && \
  apt install -y --no-install-recommends mkvtoolnix

# Add Python dependencies
COPY requirements.txt ./

# Install audio-offset-finder
RUN \
  pipx install audio-offset-finder && \
  pipx ensurepath

# Install Node.js dependencies
COPY .yarn/patches .yarn/patches
COPY package.json yarn.lock ./

RUN \
  npm install -g -y corepack@latest && \
  corepack enable yarn && \
  yarn install

# Add repo files to the container
COPY . .

CMD ["sleep", "infinity"]
