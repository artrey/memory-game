# Memory game

### Setup https

1. Generate certificate

```bash
mkdir -p cert
openssl genrsa 2048 > cert/key.pem
openssl req -x509 -days 365 -new -key cert/key.pem -out cert/cert.pem
# fill the form
```

2. Add liveServer https settings (`.vscode/settings.json`)

```json
{
  "liveServer.settings.host": "localhost",
  "liveServer.settings.https": {
    "enable": true,
    "cert": "/full-path-to-your-wordir/cert/cert.pem",
    "key": "/full-path-to-your-wordir/cert/key.pem",
    "passphrase": ""
  }
}
```
