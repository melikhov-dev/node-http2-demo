# node-http2-demo
Simple demo Node.js + HTTP2 + Service Workers

Node >=8.4.0 require.

Creating certificates:

```
openssl genrsa -out server.key 1024
openssl req -new -key server.key -out server.csr
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
```

Start

```npm start```

Open Chrome with `--ignore-certificate-errors`:

``` 
open /Applications/Google\ Chrome.app --args   --ignore-certificate-errors
```
