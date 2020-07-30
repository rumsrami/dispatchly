deploy:
	echo '/*    /index.html   200' > ./build/_redirects && \
	netlify deploy --prod

delete-build:
	rm -rf build

build:
	export INLINE_RUNTIME_CHUNK=false && yarn build

run: delete-build build
	http-server ./build/

start:
	http-server ./build/

# copy: 
# 	rm -rf ../cmd/dispatch/internal/public/* && \
# 	cp -R build/ ../cmd/dispatch/internal/public/