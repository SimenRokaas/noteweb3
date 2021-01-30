#!/usr/bin/env bash
echo "Har du stoppet node-app på server? https://nl1-ss12.a2hosting.com:2083/cpsess6359040869/frontend/paper_lantern/lveversion/nodejs-selector.html.tt#/"
select yn in "ja" "nei"; do
    case $yn in
        ja ) echo "Fint, da kjører vi på!"; break;;
        nei ) echo "Stopp app på server og prøv igjen!"; exit;;
    esac
done

echo "================================================================================================================="
echo " Bygger frontend for production (NODE_ENV=production) slik at API-kall går til tjk.no... "
echo "================================================================================================================="

cd frontend
npm run build # bygger med NODE_ENV=production

echo "================================================================================================================="
echo " Lager tgz-filer for overføring... "
echo "================================================================================================================="

cd ..
tar -zcvf server.tgz *.js *.json routes
echo ""
tar -zcvf frontend-dist.tgz frontend/dist

echo "================================================================================================================="
echo "Laster opp til server..."
echo "================================================================================================================="

scp -P 7822 server.tgz frontend-dist.tgz tjkno@nl1-ss12.a2hosting.com:/home/tjkno/tmp

echo "================================================================================================================="
echo "Tar backup og Pakker ut på server..."
echo "================================================================================================================="

ssh -p 7822 tjkno@nl1-ss12.a2hosting.com <<'ENDSSH'
  # commands to run on remote host
  # Lager backup av gjeldende versjon
  tar -zcvf noter-backup-$(date +%Y-%m-%d_%H%M).tgz noter/*.js noter/frontend noter/routes
  # Fjern gjeldende versjon. NB! La node_modules ligge!
  cd noter
  rm -r *.js *.json frontend public routes tmp
  # Pakker ut fra opplastet ny versjon
  tar -zxvf ../tmp/server.tgz
  tar -zxvf ../tmp/frontend-dist.tgz
ENDSSH

echo "================================================================================================================="
echo " Rydder opp..."
echo "================================================================================================================="

rm server.tgz frontend-dist.tgz

echo ""
echo "Ferdig."
