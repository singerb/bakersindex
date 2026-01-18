POSTS := $(shell find src/ -maxdepth 1 -type f | sort -r)
POSTS_HTML := $(patsubst src/%.md,build/%.html,$(POSTS))
INDEX_POSTS := $(shell find src/ -maxdepth 1 -type f | sort -r | head -n 1)

.PHONY: all clean
all: build/index.html $(POSTS_HTML)

build/index.html: $(INDEX_POSTS) sidebar.md footer.md header.md
	~/go/bin/minipage -sidebar sidebar.md -title "The Baker's Index - Blog" header.md $(INDEX_POSTS) footer.md > $@

build/%.html: src/%.md header.md sidebar.md footer.md
	~/go/bin/minipage -sidebar sidebar.md -title "The Baker's Index - `cat $< | rg -o '<!-- title: (.+) -->' -r '$$1'`" header.md $< footer.md > $@

sidebar.md: $(POSTS)
	./generate-sidebar.sh > $@
clean:
	rm build/*.html
	rm sidebar.md
