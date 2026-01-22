POSTS := $(shell find src/ -maxdepth 1 -type f | grep -E \.md$ | sort -r)
POSTS_HTML := $(patsubst src/%.md,../docs/%.html,$(POSTS))
INDEX_POSTS := $(shell find src/ -maxdepth 1 -type f | grep -E \.md$ | sort -r | head -n 1)

.PHONY: all clean images
all: ../docs/index.html $(POSTS_HTML) images

../docs/index.html: $(INDEX_POSTS) sidebar.md footer.md header.md
	~/go/bin/minipage -sidebar sidebar.md -title "The Baker's Index - Blog" header.md $(INDEX_POSTS) footer.md > $@

../docs/%.html: src/%.md header.md sidebar.md footer.md
	~/go/bin/minipage -sidebar sidebar.md -title "The Baker's Index - `cat $< | rg -o '<!-- title: (.+) -->' -r '$$1'`" header.md $< footer.md > $@

sidebar.md: $(POSTS)
	./generate-sidebar.sh > $@

images:
	cp src/*.png ../docs/
clean:
	rm ../docs/*.html
	rm ../docs/*.png
	rm sidebar.md
