NODE_SASS_BIN := node_modules/node-sass/bin/node-sass
HUGO := hugo
NPM := npm

install:
	$(NPM) install
build-bootstrapjs:
	mkdir -p static/fonts/vendor/
	cp node_modules/bootstrap/dist/js/bootstrap.min.js static/js/vendor/
copy-webfonts:
	mkdir -p static/fonts/vendor/
	cp node_modules/@fortawesome/fontawesome-free/webfonts/* static/fonts/vendor/

build: copy-webfonts build-bootstrapjs
	$(HUGO)
serve: copy-webfonts build-bootstrapjs
	$(HUGO) serve