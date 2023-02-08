#!/bin/bash


root=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}"   )" &> /dev/null && pwd );

abort() {
  echo [!] $@ 1>&2
  exit 1
}

flushAll() {
  echo [*] flushing database
  docker-compose stop
  docker-compose rm
  docker volume rm setup_redis
}

. .env

flush=0
migration=0
while :; do
  case $1 in
    --flush | -f) flush=1;;
    --migration | -m) migration=1;;
    -*) abort "unknown options";;
    *) test -z "$1" && break || abort "unkown options";;
  esac
  shift
done

if [ $flush -eq 1 ]; then
  flushAll
else
  docker-compose up -d 
  sleep 2
fi

if [ $migration -eq 1 ]; then
  cd $root/..
  npm run predev
  npx prisma db push
fi
