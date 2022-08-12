# Obyte explorer frontend

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/)

+ [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur)
+ [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)

Or [Webstorm](https://www.jetbrains.com/webstorm/)

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Explorer backend

For development specify a link to the backend in vite.config.js if it differs
from http://localhost:4000

For production, you can use this config for nginx

```text
server {
        listen 80;
        server_name localhost;

        access_log /var/log/nginx/explorer_front.log main;
        error_log /var/log/nginx/explorer_front_error.log;

        root /var/www/html;

        location / {
                try_files $uri $uri/ /index.html;
        }

        location ~ /api/(unit|address|asset)/|/socket.io/ {
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_pass http://127.0.0.1:14000;
        }

        location ~ /\.(svn|git|ht) {
                deny all;
        }
}
```
