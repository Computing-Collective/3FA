# Admin System Backend

## Running Instructions

### Setup

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
### Usage

Run the server (production):
> **Note**
> Gunicorn does not run on Windows. You will need to use WSL
```shell
pipenv run gunicorn -b :5000 -w 4 'api.app:create_app()'
```

Run the server (development mode):
> **Note**
> You will need your laptop's Wi-Fi hotspot turned on to use this IP address. You can always change the IP address to localhost if you don't want to do this.
```shell
pipenv run flask -A api.app.py --debug run -h 192.168.137.1 --cert=adhoc
```
With `localhost`:
```shell
pipenv run flask -A api.app.py --debug run -h 0.0.0.0 --cert=adhoc
```

Run tests with coverage:
```shell
pipenv run pytest --cov=api --cov-branch
```

## Documentation

### Database

The database is organized into the following tables. Specific table details and their fields can be found in [`models.py`](api/models.py).

![img.png](images/database-diagram.png)
