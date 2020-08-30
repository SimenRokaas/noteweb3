#!/usr/bin/env bash
echo "================================================================================================================="
echo " Bygger frontend for production (NODE_ENV=production) slik at API-kall går til https://tjk.no/notearkiv/noter... "
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
echo "Pakker ut på server..."
echo "================================================================================================================="

ssh -p 7822 tjkno@nl1-ss12.a2hosting.com <<'ENDSSH'
  # commands to run on remote host
  cd noter
  tar -zxvf ../tmp/server.tgz
  tar -zxvf ../tmp/frontend-dist.tgz
ENDSSH

echo "================================================================================================================="
echo " Rydder opp..."
echo "================================================================================================================="

rm server.tgz frontend-dist.tgz

echo ""
echo "Ferdig."
