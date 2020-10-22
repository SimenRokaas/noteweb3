# TJK Notearkiv
### Med PrimeVue + Node + Express +MySql
![alt text](vue-node-express-mysql-architecture.png "Architecture")

### Backend
Node + Express + Cors + MySql

### Frontend
PrimeVue + Axios

### Teste prod-bygg lokalt
Frontend bygges med NODE_ENV=development slik at API-kall går til localhost

Backend kjøres lokalt med NODE_ENV=production slik at frontend serves fra dist-folder.

    cd frontend
    npm run build-dev // bygger frontend/dist med NODE_ENV=development
    cd ..
    npm run prod-local // kjører med NODE_ENV=production

### Oppdatere på server

#### Den enkle måten
    ./shipit.sh
    
Skriptet vil spørre om ssh-passord to ganger.

#### Den manuelle måten

Frontend bygges med NODE_ENV=production slik at API-kall går til https://tjk.no/notearkiv/noter

Backend kjøres (på server) med NODE_ENV=production slik at frontend serves fra dist-folder.

    cd frontend
    npm run build // bygger med NODE_ENV=production

1. Last opp backend-katalogen + frontend/dist til server
1. Sjekk oppsett på server - se node.js setup på webhotell (A2 hosting)

Se `shipit.sh`for detaljer om overføring til server.

## Oppdatere npm-avhengigheter
    npx npm-check-updates -u
    npm install
    
Se https://www.carlrippon.com/upgrading-npm-dependencies/