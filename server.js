const http2 = require('http2');
const fs = require('fs');
const url = require('url');
const path = require('path');

const options = {
	key: fs.readFileSync('/etc/nginx/ssl/key.pem'),
	cert: fs.readFileSync('/etc/nginx/ssl/cert.pem')
};

const mimeType = {
	'.ico': 'image/x-icon',
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.json': 'application/json',
	'.css': 'text/css',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.wav': 'audio/wav',
	'.mp3': 'audio/mpeg',
	'.svg': 'image/svg+xml',
	'.pdf': 'application/pdf',
	'.doc': 'application/msword',
	'.eot': 'appliaction/vnd.ms-fontobject',
	'.ttf': 'aplication/font-sfnt'
};

const server = http2.createSecureServer(options);
const commonCSS = fs.readFileSync('public/common.css');


server.on('stream', (stream, headers) => {

  console.log(`${headers[':method']} ${headers[':path']}`);
  // parse URL
  const parsedUrl = url.parse(headers[':path']);
  // extract URL path
  let pathname = path.join('public', `.${parsedUrl.pathname}`);
  const ext = path.parse(pathname).ext;
  if (headers[':path'] === '/ymoney.html') {
        console.log('test');
	stream.pushStream({ ':path': '/public/common.css' }, (pushStream) => {
		pushStream.respond({ ':status': 200, 'content-type': 'text/css'});
		pushStream.end(commonCSS, () => {
		});

	});	
	const indexPath = path.join(__dirname, pathname);
	const readStream = fs.createReadStream(indexPath);
	readStream.on('open', function () {
		stream.respond({'content-type': mimeType[ext] || 'text/plain', ':status': 200});
		readStream.pipe(stream);
	});
  } else { 
	  // maps file extention to MIME types
	  fs.exists(pathname, function(exist) {
			if (!exist) {
				// if the file is not found, return 404
				stream.respond({':status': 404});
				stream.end(`File ${pathname} not found!`);
				return;
			}
			// if is a directory, then look for index.html
			if (fs.statSync(pathname).isDirectory()) {
				pathname += '/index.html';
			}
			
			const indexPath = path.join(__dirname, pathname);
	  		const readStream = fs.createReadStream(indexPath);
			readStream.on('open', function () {
				stream.respond({'content-type': mimeType[ext] || 'text/plain', ':status': 200});
				readStream.pipe(stream);
			});

			readStream.on('error', function(err) {
				stream.respond({':status': 500});
				stream.end(`Error getting the file: ${err}.`);
			});
		 });

	}
});
 
server.listen(8800);
