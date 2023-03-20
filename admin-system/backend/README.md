# Admin System Backend

## Running Instructions

### Setup

1. Visit the Sqlite [download page](https://www.sqlite.org/download.html) and download the latest version of the sqlite binary for your platform.

2. Install dependencies:
   > **Note:**
   > Expects that you have [pipenv](https://pipenv.pypa.io/en/latest/) installed and Python 3.11
    ```shell
    pipenv install
    ```
### Usage

Run the server (development mode):
> **Note:**
> You will need your laptop's Wi-Fi hotspot turned on to use this IP address. You can always change the IP address to localhost if you don't want to do this.
```shell
pipenv run flask -A api.app.py --debug run -h 192.168.137.1 --cert=adhoc
```

Run tests with coverage:
```shell
pipenv run pytest --cov=api --cov-branch
```

## Documentation

### Database

The database is organized into the following tables. Specific table details and their fields can be found in [`models.py`](api/models.py).

![img.png](images/database-diagram.png)
