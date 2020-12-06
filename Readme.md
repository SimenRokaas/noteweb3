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

## Listing og nedlasting av noter

Skannede noter ligger på https://tjk.no/TJK-medlem/02 Noteskann/ .
Men siden noter er underlagt opphavsrett og ikke kan deles fritt, så er `TJK-medlem`
og underliggende mapper underlagt tilgangskontroll med `.htaccess` på server, slik:

    # Tillat listing av mapper slik at notearkiv kan generere linker til noter
    Options +Indexes
    IndexOptions SuppressSize SuppressDescription SuppressLastModified SuppressColumnsorting
    IndexIgnore . ..
    
    # Deny access to files with given extensions
    <FilesMatch "\.(png|jpg|jpeg|gif|pdf|doc|docx|csv|xls|xslx)$">
    Order deny,allow
    Deny from all
    # Tillat fra PROD
    Allow from noter.tjk.no
    Allow from xxx.xxx.xxx.xxx
    # Tillat fra dev-maskin
    Allow from xxx.xxx.xxx.xxx
    
    </FilesMatch>
    
Første linje gjør at alle kan liste kataloger, men de framstår tomme hvis
man ikke kommer fra `noter.tjk.no` eller DEV-maskin.
`IndexOptions` må være slik for at link-generering skal fungere i `noter.js`.

NB: Per desember 2020 ser det ut til at allow-from bare fungerer med IP.