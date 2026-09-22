# Build settings shared by everyone who ships an image. No secrets and no site configuration in
# here: the image is site-agnostic, everything it needs comes from the server at runtime.
# Personal overrides go in deploy/config.local.mk, which is not in git.

# Docker Hub repository, without tag: <namespace>/<repo>. Run `docker login` once.
IMAGE ?= indicatedata/indicate-data.com

# CPU architecture of the server: linux/amd64 (most VPS) or linux/arm64 (e.g. Hetzner CAX).
PLATFORM ?= linux/amd64
