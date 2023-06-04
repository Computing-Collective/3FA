[![Admin Backend CI](https://github.com/TODO-nwHacks-2023/3FA/actions/workflows/admin-backend.yml/badge.svg)](https://github.com/TODO-nwHacks-2023/3FA/actions/workflows/admin-backend.yml) [![Admin Dashboard CI](https://github.com/TODO-nwHacks-2023/3FA/actions/workflows/admin-frontend.yml/badge.svg)](https://github.com/TODO-nwHacks-2023/3FA/actions/workflows/admin-frontend.yml) [![Client CI](https://github.com/TODO-nwHacks-2023/3FA/actions/workflows/client.yml/badge.svg)](https://github.com/TODO-nwHacks-2023/3FA/actions/workflows/client.yml) [![Netlify Status](https://api.netlify.com/api/v1/badges/de6e4782-896a-48d9-ac91-0c10844f0a24/deploy-status)](https://app.netlify.com/sites/3fa/deploys)

# 3FA

A secure and scalable multi-factor authentication system including a client application, admin dashboard, and backend server. The implementation seen here implements a secure file storage system but the underlying authentication system could be used for any application.

## Table of Contents
- [3FA](#3fa)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Using our servers](#using-our-servers)
    - [Setting up your own servers](#setting-up-your-own-servers)
  - [Repository Contents](#repository-contents)
  - [Architecture Overview](#architecture-overview)

## Overview

Here is a video overview of our system. You can [view it on YouTube](https://www.youtube.com/watch?v=EXM25gpxC9Y) or [download the file directly](/static/Demo%20Video.mp4) if you prefer.

https://github.com/Computing-Collective/3FA/assets/52972357/1cd9538f-6b38-4530-9f8f-198096261e36

## Features

- Client application to manage secure file storage
- Encrypted communications between clients and the server
- Only hashed passwords stored in the database
- Custom microcontroller setup for authentication
- Multi-factor authentication
  - Password
  - Facial recognition
  - Motion device authentication
- Admin dashboard to view login attempts

## Getting Started

### Using our servers

1. Install the latest version of the client application from the [releases page](https://github.com/Computing-Collective/3FA/releases) and run it.
2. You can then create an account and start using the application by uploading and managing files.
3. The admin dashboard can be found at [3fa.netlify.app](https://3fa.netlify.app/). You can use the account `admin@3fa.com` with the password `Password1` to login. Note that you will have to login to the client application with these credentials first.

> **Note**:
> To avoid having to construct the microcontroller device yourself, you can use either sign up with accounts that do not use the sensor password option or you can use the [mock device script](/embedded/demo/mock_pico.py) in the embedded folder along with a REST client like Postman to authenticate with the server (not recommended without a thorough understanding of the system). If you choose the latter option, you will benefit from reading [`API.md`](/admin-system/backend/API.md) to better understand the API.

### Setting up your own servers

1. See [`/admin-system/backend/README.md`](/admin-system/backend/README.md) to setup the backend server.
2. See [`/admin-system/frontend/README.md`](/admin-system/frontend/README.md) to setup the admin dashboard.
3. See [`/client/README.md`](/client/README.md) to setup the client application.

## Repository Contents

```shell
3FA
├─ .github           # GitHub Actions CI/CD - testing and deployment
|
├─ admin-system      # Admin dashboard and backend server
│  ├─ backend           # Flask backend server
│  │  ├─ api               # Implementation of the API
│  │  └─ tests             # Tests for the API
│  └─ frontend          # React admin dashboard
|
├─ client            # Electron client application
|
├─ embedded          # Microcontroller authentication device code
│  ├─ application       # Top level application code
│  ├─ demo              # Demo modules for features of the main application
│  └─ lib               # Saved CircuitPython library dependencies
|
├─ machine-learning  # Machine learning model training and testing
│  └─ data              # Dataset for training and testing
└─ static            # Static files for project README
```

## Architecture Overview

Photo

Tldr
