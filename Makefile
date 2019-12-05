NODE_SASS_BIN := node_modules/node-sass/bin/node-sass
HUGO := hugo
NPM := npm

install:
	$(NPM) install
css-compile:
	$(NODE_SASS_BIN) --output-style expanded --source-map true --source-map-contents true --precision 6 src/style.scss static/css/style.css
build-bootstrapjs:
	cp node_modules/bootstrap/dist/js/bootstrap.min.js static/js/vendor/

build: css-compile build-bootstrapjs
	$(HUGO)
serve: css-compile build-bootstrapjs
	$(HUGO) serve