FROM node:22-slim
WORKDIR /app

# Set up locales
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

RUN log() { echo "[$(date +"%Y-%m-%d %H:%M:%S")] $1"; };

# Install the application dependencies
RUN \
  apt update && \
  apt install -y --no-install-recommends wget && \
  wget -O /etc/apt/keyrings/gpg-pub-moritzbunkus.gpg https://mkvtoolnix.download/gpg-pub-moritzbunkus.gpg && \
  echo "deb [signed-by=/etc/apt/keyrings/gpg-pub-moritzbunkus.gpg] https://mkvtoolnix.download/debian/ bookworm main" > /etc/apt/sources.list.d/mkvtoolnix.download.list && \
  apt update && \
  apt install -y --no-install-recommends build-essential ffmpeg git locales mediainfo mkvtoolnix pipx python3 && \
  sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen

# Add Python dependencies
COPY requirements.txt ./

# Install audio-offset-finder
RUN \
  pipx install audio-offset-finder && \
  pipx ensurepath

# Install Node.js dependencies
COPY package.json yarn.lock ./

# Add repo files to the container
COPY . .

# Set up an app user so the container doesn't run as the root user
RUN useradd apps
USER apps

ENTRYPOINT ["/bin/bash", "-c"]

CMD ["sleep", "infinity"]
