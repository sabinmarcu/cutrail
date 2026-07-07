FROM archlinux:latest AS yay-builder

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN pacman -Syu --noconfirm --needed base-devel git go

RUN git clone https://github.com/Jguer/yay.git /tmp/yay \
    && cd /tmp/yay \
    && make build

FROM archlinux:latest

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN pacman -Syu --noconfirm --needed base-devel git sudo ca-certificates

COPY --from=yay-builder /tmp/yay/yay /usr/local/bin/yay

RUN useradd -m -G wheel build \
    && printf '%%wheel ALL=(ALL) NOPASSWD: ALL\n' > /etc/sudoers.d/wheel \
    && chmod 0440 /etc/sudoers.d/wheel

ENV HOME=/home/build
WORKDIR /workspace
USER build