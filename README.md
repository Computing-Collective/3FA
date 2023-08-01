[![Admin Backend CI/CD](https://github.com/Computing-Collective/3FA/actions/workflows/admin-backend.yml/badge.svg)](https://github.com/Computing-Collective/3FA/actions/workflows/admin-backend.yml) [![Admin Dashboard CI](https://github.com/Computing-Collective/3FA/actions/workflows/admin-frontend.yml/badge.svg)](https://github.com/Computing-Collective/3FA/actions/workflows/admin-frontend.yml) [![Client CI](https://github.com/Computing-Collective/3FA/actions/workflows/client.yml/badge.svg)](https://github.com/Computing-Collective/3FA/actions/workflows/client.yml) [![Netlify Status](https://api.netlify.com/api/v1/badges/de6e4782-896a-48d9-ac91-0c10844f0a24/deploy-status)](https://app.netlify.com/sites/3fa/deploys)

# 3FA

A secure and scalable multi-factor authentication system including a client application, admin dashboard, and backend server. The implementation seen here implements a secure file storage system but the underlying authentication system could be used for any application.

![Status Page](https://img.shields.io/badge/Status%20Page-3cc45f?style=for-the-badge&link=https%3A%2F%2Fcomputing-collective.github.io%2F3FA-Status)

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

Here is a video overview of our system. You can [view it on YouTube](https://www.youtube.com/watch?v=EXM25gpxC9Y) if you prefer.

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
> To avoid having to construct the microcontroller device yourself, you can use either sign up with accounts that do not use the sensor password option or you can use the [mock device script](/embedded/demo/mock_pico.py) in the embedded folder along with a REST client like Postman to authenticate with the server (not recommended without a thorough understanding of the system). If you choose the latter option, you will benefit from reading [`API.md`](/admin-system/backend/API.md) to better understand the API. You can also import the [Postman collection](admin-system/backend/postman-collection.json) and [Postman environment](admin-system/backend/postman-environment.json) to get started.

### Setting up your own servers

1. See [`/admin-system/backend/README.md`](/admin-system/backend/README.md) to setup the backend server.
2. See [`/admin-system/frontend/README.md`](/admin-system/frontend/README.md) to setup the admin dashboard.
3. See [`/client/README.md`](/client/README.md) to setup the client application.

## Repository Contents

```
3FA
├─ .github           # GitHub Actions CI/CD - testing and deployment
|
├─ admin-system      # Admin dashboard and backend server
│  ├─ backend           # Flask backend server                        - Elio
│  │  ├─ api               # Implementation of the API
│  │  └─ tests             # Tests for the API
│  └─ frontend          # React admin dashboard                       - Kelvin
|
├─ client            # Electron client application                    - Kelvin
|
├─ embedded          # Microcontroller authentication device code     - Matthew
│  ├─ application       # Top level application code
│  ├─ demo              # Demo modules for features of the main application
│  └─ lib               # Saved CircuitPython library dependencies
|
├─ machine-learning  # Machine learning model training and testing    - Divy
│  └─ data              # Dataset for training and testing
└─ static            # Static files for project README
```

## Architecture Overview

This is our system overview detailing the interactions between all the hardware and software.

![Systems Diagram](/static/System%20Diagram.jpg)
