# Reference: https://pipenv.pypa.io/en/latest/docker/

FROM python:3.11 AS builder

RUN pip install --user pipenv

# Tell pipenv to create venv in the current directory
ENV PIPENV_VENV_IN_PROJECT=1

# Pipfile contains requests
ADD Pipfile.lock Pipfile /usr/src/

WORKDIR /usr/src

# Install pipenv packages
RUN /root/.local/bin/pipenv sync --dev

RUN /usr/src/.venv/bin/python -c "import requests; print(requests.__version__)"

FROM python:3.11 AS runtime

RUN mkdir -v /usr/src/.venv

COPY --from=builder /usr/src/.venv/ /usr/src/.venv/

RUN /usr/src/.venv/bin/python -c "import requests; print(requests.__version__)"

RUN adduser --uid 123123 backend
COPY / /usr/src/

WORKDIR /usr/src/

# Change ownership of the files to the backend user so that the backend user can write to the files
RUN chown -R backend:backend /usr/src/

USER backend
EXPOSE 5000
VOLUME /app/data

CMD ./.venv/bin/python -m gunicorn -b :5000 -w 4 --pythonpath /usr/src 'api.app:create_app()'
