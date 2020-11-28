# TJKNoter frontend

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Listing og nedlasting av noter

Skannede noter er lagt opp på https://tjk.no/TJK-medlem/02%20Noteskann/ .
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
    # Tillat fra dev-maskin
    Allow from xxx.xxx.xxx.xxx
    
    </FilesMatch>
    
Første linje gjør at alle kan liste kataloger, men de framstår tomme hvis
man ikke kommer fra `noter.tjk.no` eller DEV-maskin.
`IndexOptions` må være slik for at link-generering skal fungere i `LinkDialog.vue`.