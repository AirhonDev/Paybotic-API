# Paybotic Backend
##### Repository that will house the Paybotic MCA offering service
&nbsp;

## DB Migration Initialization
1. MySQL docker container should be run via "docker-compose up -d"
2. Create DB migration via "npm run migrate:make <migration_name>"
3. Run DB migrations via "npm run db:migrate:latest"
4. Create DB seed via "npm run seed:make <seed_name>"
5. Run DB seeds via "seed:run"

## Development

Server requires [Node.js](https://nodejs.org/) v14.15.0 to run.
Install the dependencies and devDependencies and start the server.
Uses docker-compose to spawn the dockerized MySQL DB

```sh
cd <directory>
docker-compose up -d // run DB docker container
npm run dev // start dev environment
```


## Docker

The worker is very easy to install and deploy in a Docker container.


```sh
cd <directory>
docker build -t <youruser>/paybotic-backend:${package.json.version} .
```


## License

MIT

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [PlGa]: <https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md>