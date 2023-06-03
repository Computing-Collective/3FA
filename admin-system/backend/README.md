# Admin System Backend

## Setup

> **Note**
> This can be skipped if you simply want to run the Docker image

1. Install `pipenv`. See the [documentation](https://pipenv.pypa.io/en/latest/) if you run into any issues with it.
   ```shell
   pip install --user pipenv
   ```

2. Install dependencies:
   > **Note**
   > Expects that you have Python 3.11
    ```shell
    pipenv sync --dev
    ```
3. Run the Machine Learning model generation script:
   ```shell
   cd ../../machine-learning
    ```
    ```shell
   pip install -r requirements.txt
   ```
    ```shell
   python model.py
   ```
   ```shell
   cd ../admin-system/backend
   ```
4. Move the generated model to the `instance` folder   

## Usage

### Docker

#### Pull the image
```shell
docker pull ghcr.io/computing-collective/3fa-backend:latest
```

#### Copy the instance folder from the container
```shell
mkdir -p instance
docker run -d --name copy ghcr.io/computing-collective/3fa-backend:latest
sleep 20 # Wait 20 seconds for the container to initialize
docker stop copy
docker cp copy:/usr/src/instance/ ./
docker rm copy
```

#### Run the container
> **Note**
> You will need your laptop's Wi-Fi hotspot turned on to use this IP address. You can always change the IP address to localhost if you don't want to do this.
```shell
docker run -p 192.168.137.1:5000:5000 --name admin-server --mount type=bind,src=instance,target=/usr/src/instance ghcr.io/computing-collective/3fa-backend:latest
```
Access the server at [192.168.137.1:5000](http://192.168.137.1:5000)

With `localhost`:
```shell
docker-compose up # From the admin-system/backend directory
OR
docker run -p 5000:5000 --name admin-server --mount type=bind,src=instance,target=/usr/src/instance ghcr.io/computing-collective/3fa-backend:latest
```
Access the server at [localhost:5000](http://localhost:5000)

#### Run tests with coverage
```shell
docker run --rm ghcr.io/computing-collective/3fa-backend:latest /usr/src/.venv/bin/python -m pytest --cov=api --cov-branch
```

#### Build the image
```shell
docker build -t ghcr.io/computing-collective/3fa-backend:latest .
```

### Local

#### Run the server (production)
> **Note**
> Gunicorn does not run on Windows. You will need to use WSL
```shell
pipenv run gunicorn -b :5000 -w 4 'api.app:create_app()'
```
Access the server at [localhost:5000](http://localhost:5000)

#### Run the server (development mode)
> **Note**
> You will need your laptop's Wi-Fi hotspot turned on to use this IP address. You can always change the IP address to localhost if you don't want to do this.
```shell
pipenv run flask -A api.app.py --debug run -h 192.168.137.1
```
Access the server at [192.168.137.1:5000](http://192.168.137.1:5000)


With `localhost`:
```shell
pipenv run flask -A api.app.py --debug run -h 0.0.0.0
```
Access the server at [localhost:5000](http://localhost:5000)

#### Run tests with coverage
```shell
pipenv run pytest --cov=api --cov-branch
```

## Documentation

### Database

The database is organized into the following tables. Specific table details and their fields can be found in [`models.py`](api/models.py).

![img.png](images/database-diagram.png)
