#!/usr/bin/env bash
echo "Har du stoppet node-app på server?"
select yn in "ja" "nei"; do
    case $yn in
        ja ) echo "Fint, da kjører vi på!"; break;;
        nei ) echo "Stopp app på server og prøv igjen!"; exit;;
    esac
done

echo "================================================================================================================="
echo " Bygger frontend for production (NODE_ENV=production) slik at API-kall går til notearkiv.tjk.no... "
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

#scp -P 7822 server.tgz frontend-dist.tgz tjkno@nl1-ss12.a2hosting.com:/home/tjkno/tmp
scp -P 7822 server.tgz frontend-dist.tgz tjkno@190.92.134.172:/home/tjkno/tmp

echo "================================================================================================================="
echo "Tar backup og Pakker ut på server..."
echo "================================================================================================================="

ssh -p 7822 tjkno@190.92.134.172 <<'ENDSSH'
  # commands to run on remote host
  echo "tjk.no server: Lager backup av gjeldende versjon..."
  tar -zcvf noter-backup-$(date +%Y-%m-%d_%H%M).tgz notearkiv-server/*.js notearkiv-server/frontend notearkiv-server/routes
  echo "tjk.no server: Fjerner gjeldende versjon. NB! Lar node_modules ligge!"
  cd notearkiv-server
  rm -r *.js *.json frontend routes
  echo "tjk.no server: Pakker ut fra opplastet ny versjon..."
  tar -zxvf ../tmp/server.tgz
  tar -zxvf ../tmp/frontend-dist.tgz
ENDSSH

echo "================================================================================================================="
echo " Rydder opp..."
echo "================================================================================================================="

rm server.tgz frontend-dist.tgz

echo ""
echo "Ferdig."
