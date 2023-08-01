
# 3FA

Backend API for the 3FA service which interacts with the client application, admin dashboard, and motion devices.

Note the variables `{{hostname}}` and `{{port}}` are placeholders for the hostname and port of the server which are usually `localhost` or `192.192.168.137.1` and `5000` respectively.



## Endpoints

- [3FA](#3fa)
  - [Endpoints](#endpoints)
  - [Admin Dashboard API](#admin-dashboard-api)
    - [1. Status Check](#1-status-check)
      - [I. Example Request: OK](#i-example-request-ok)
      - [I. Example Response: OK](#i-example-response-ok)
    - [2. Failed Events](#2-failed-events)
      - [I. Example Request: List (No Images)](#i-example-request-list-no-images)
      - [I. Example Response: List (No Images)](#i-example-response-list-no-images)
      - [II. Example Request: Email Specific](#ii-example-request-email-specific)
      - [II. Example Response: Email Specific](#ii-example-response-email-specific)
      - [III. Example Request: Session ID Specific](#iii-example-request-session-id-specific)
      - [III. Example Response: Session ID Specific](#iii-example-response-session-id-specific)
    - [3. Login](#3-login)
      - [I. Example Request: Successful](#i-example-request-successful)
      - [I. Example Response: Successful](#i-example-response-successful)
      - [II. Example Request: Invalid Email / Password](#ii-example-request-invalid-email--password)
      - [II. Example Response: Invalid Email / Password](#ii-example-response-invalid-email--password)
      - [III. Example Request: Not Admin User](#iii-example-request-not-admin-user)
      - [III. Example Response: Not Admin User](#iii-example-response-not-admin-user)
    - [4. Login Sessions](#4-login-sessions)
      - [I. Example Request: Successful](#i-example-request-successful-1)
      - [I. Example Response: Successful](#i-example-response-successful-1)
      - [II. Example Request: Count Param](#ii-example-request-count-param)
      - [II. Example Response: Count Param](#ii-example-response-count-param)
  - [Client API](#client-api)
    - [1. Login](#1-login)
      - [a. Email](#a-email)
        - [I. Example Request: Successful](#i-example-request-successful-2)
        - [I. Example Response: Successful](#i-example-response-successful-2)
        - [II. Example Request: Email Doesn't Exist / Bad Formatting](#ii-example-request-email-doesnt-exist--bad-formatting)
        - [II. Example Response: Email Doesn't Exist / Bad Formatting](#ii-example-response-email-doesnt-exist--bad-formatting)
      - [b. Password](#b-password)
        - [I. Example Request: Successful](#i-example-request-successful-3)
        - [I. Example Response: Successful](#i-example-response-successful-3)
        - [II. Example Request: Wrong Password](#ii-example-request-wrong-password)
        - [II. Example Response: Wrong Password](#ii-example-response-wrong-password)
      - [c. Unique Pico ID](#c-unique-pico-id)
        - [I. Example Request: Unique](#i-example-request-unique)
        - [I. Example Response: Unique](#i-example-response-unique)
        - [II. Example Request: Non-Unique](#ii-example-request-non-unique)
        - [II. Example Response: Non-Unique](#ii-example-response-non-unique)
      - [d. Motion Pattern Initialize](#d-motion-pattern-initialize)
        - [I. Example Request: Successful](#i-example-request-successful-4)
        - [I. Example Response: Successful](#i-example-response-successful-4)
        - [II. Example Request: Expired Session](#ii-example-request-expired-session)
        - [II. Example Response: Expired Session](#ii-example-response-expired-session)
        - [III. Example Request: Wrong Stage](#iii-example-request-wrong-stage)
        - [III. Example Response: Wrong Stage](#iii-example-response-wrong-stage)
        - [IV. Example Request: Incorrect Pattern](#iv-example-request-incorrect-pattern)
        - [IV. Example Response: Incorrect Pattern](#iv-example-response-incorrect-pattern)
      - [e. Motion Pattern Validate](#e-motion-pattern-validate)
        - [I. Example Request: Incorrect Pattern](#i-example-request-incorrect-pattern)
        - [I. Example Response: Incorrect Pattern](#i-example-response-incorrect-pattern)
        - [II. Example Request: Successful](#ii-example-request-successful)
        - [II. Example Response: Successful](#ii-example-response-successful)
      - [f. Face Recognition](#f-face-recognition)
        - [I. Example Request: Successful](#i-example-request-successful-5)
        - [I. Example Response: Successful](#i-example-response-successful-5)
        - [II. Example Request: Missing Photo](#ii-example-request-missing-photo)
        - [II. Example Response: Missing Photo](#ii-example-response-missing-photo)
    - [2. Files](#2-files)
      - [a. Upload File](#a-upload-file)
        - [I. Example Request: Successful](#i-example-request-successful-6)
        - [I. Example Response: Successful](#i-example-response-successful-6)
        - [II. Example Request: Invalid ID](#ii-example-request-invalid-id)
        - [II. Example Response: Invalid ID](#ii-example-response-invalid-id)
        - [III. Example Request: Wrong Body Type](#iii-example-request-wrong-body-type)
        - [III. Example Response: Wrong Body Type](#iii-example-response-wrong-body-type)
        - [IV. Example Request: Duplicate File Name](#iv-example-request-duplicate-file-name)
        - [IV. Example Response: Duplicate File Name](#iv-example-response-duplicate-file-name)
      - [b. List Files](#b-list-files)
        - [I. Example Request: Successful](#i-example-request-successful-7)
        - [I. Example Response: Successful](#i-example-response-successful-7)
      - [c. File Download](#c-file-download)
      - [d. Delete File](#d-delete-file)
    - [3. Index](#3-index)
      - [I. Example Request: Success](#i-example-request-success)
      - [I. Example Response: Success](#i-example-response-success)
    - [4. Signup](#4-signup)
      - [I. Example Request: Successful](#i-example-request-successful-8)
      - [I. Example Response: Successful](#i-example-response-successful-8)
      - [II. Example Request: Require An Auth Method](#ii-example-request-require-an-auth-method)
      - [II. Example Response: Require An Auth Method](#ii-example-response-require-an-auth-method)
      - [III. Example Request: Duplicate Email](#iii-example-request-duplicate-email)
      - [III. Example Response: Duplicate Email](#iii-example-response-duplicate-email)
      - [IV. Example Request: Missing Password (When Enabled)](#iv-example-request-missing-password-when-enabled)
      - [IV. Example Response: Missing Password (When Enabled)](#iv-example-response-missing-password-when-enabled)
      - [V. Example Request: Missing Motion Pattern (When Enabled)](#v-example-request-missing-motion-pattern-when-enabled)
      - [V. Example Response: Missing Motion Pattern (When Enabled)](#v-example-response-missing-motion-pattern-when-enabled)
      - [VI. Example Request: Missing Photo (When Enabled)](#vi-example-request-missing-photo-when-enabled)
      - [VI. Example Response: Missing Photo (When Enabled)](#vi-example-response-missing-photo-when-enabled)
      - [VII. Example Request: Invalid Motion Pattern](#vii-example-request-invalid-motion-pattern)
      - [VII. Example Response: Invalid Motion Pattern](#vii-example-response-invalid-motion-pattern)
    - [5. Check Login](#5-check-login)
      - [I. Example Request: Invalid ID](#i-example-request-invalid-id)
      - [I. Example Response: Invalid ID](#i-example-response-invalid-id)
      - [II. Example Request: Valid ID](#ii-example-request-valid-id)
      - [II. Example Response: Valid ID](#ii-example-response-valid-id)
      - [III. Example Request: Expired Session / Logged Out](#iii-example-request-expired-session--logged-out)
      - [III. Example Response: Expired Session / Logged Out](#iii-example-response-expired-session--logged-out)
    - [6. Logout](#6-logout)
      - [I. Example Request: Successful](#i-example-request-successful-9)
      - [I. Example Response: Successful](#i-example-response-successful-9)
      - [II. Example Request: Invalid ID](#ii-example-request-invalid-id-1)
      - [II. Example Response: Invalid ID](#ii-example-response-invalid-id-1)
  - [Pico API](#pico-api)
    - [1. Set Pico ID](#1-set-pico-id)

--------



## Admin Dashboard API



### 1. Status Check


Check the API health


***Endpoint:***

```bash
Method: GET
Type: 
URL: {{hostname}}:{{port}}/health/
```



***More example Requests/Responses:***


#### I. Example Request: OK



***Body: None***



#### I. Example Response: OK
```js
OK
```


***Status Code:*** 200

<br>



### 2. Failed Events


Get a list of past failed login events


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{hostname}}:{{port}}/api/dashboard/failed_events/
```



***Body:***

```js        
{
    "auth_session_id": "06c6466b-9c38-4fd3-91c4-73370c941118"
}
```



***More example Requests/Responses:***


#### I. Example Request: List (No Images)


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Body:***

```js        
{
    "auth_session_id": "06c6466b-9c38-4fd3-91c4-73370c941118"
}
```



#### I. Example Response: List (No Images)
```js
{
    "events": [
        {
            "date": "22/03/2023 14:39:54",
            "event": "Incorrect added motion sequence entered.",
            "id": "e1d2a58d-7c1f-4b96-bed7-6c5abf47a6e3",
            "photo": "None",
            "session_id": "feb41b52-a4c2-4726-91c2-9e2f6db631a7"
        },
        {
            "date": "22/03/2023 14:44:11",
            "event": "Incorrect added motion sequence entered.",
            "id": "465c0a88-5f36-4c6f-9f7c-896c612cdb3e",
            "photo": "None",
            "session_id": "d6f812a5-f734-4d06-afc4-f6cf24ba5459"
        },
        {
            "date": "22/03/2023 14:46:06",
            "event": "Incorrect added motion sequence entered.",
            "id": "dfca5fdb-ad63-437a-bf74-2fc97bb308ab",
            "photo": "None",
            "session_id": "2ee94d44-c746-4d08-881e-dae5b905bc17"
        },
        {
            "date": "22/03/2023 14:54:38",
            "event": "Incorrect added motion sequence entered.",
            "id": "81906246-f848-402a-85d5-7902ad024db1",
            "photo": "None",
            "session_id": "c8d71676-e81d-41e1-aa93-4ad5e372d6ac"
        },
        {
            "date": "22/03/2023 14:56:55",
            "event": "Incorrect added motion sequence entered.",
            "id": "07142526-7cbd-4e21-aa96-e7e899151fad",
            "photo": "None",
            "session_id": "9874352c-2052-4fe2-bfc6-4f9c7268afb6"
        },
        {
            "date": "22/03/2023 15:10:30",
            "event": "Incorrect added motion sequence entered.",
            "id": "ac4176c5-afe5-4d86-baf6-7769c2354bdc",
            "photo": "None",
            "session_id": "f3fa0429-741c-4e9e-acc1-2deabb3c4c4e"
        },
        {
            "date": "22/03/2023 15:13:48",
            "event": "Incorrect added motion sequence entered.",
            "id": "7b6608a7-8e31-46cc-9d23-b9286abba406",
            "photo": "None",
            "session_id": "e6cfdd0c-b997-4f24-b019-5ec603bc864e"
        },
        {
            "date": "22/03/2023 15:20:14",
            "event": "Incorrect added motion sequence entered.",
            "id": "6675ca84-747c-4f1d-9ac0-1ff1983b60ff",
            "photo": "None",
            "session_id": "74afbd1b-a193-43e0-a0f9-3e1cb95921f6"
        },
        {
            "date": "22/03/2023 15:21:46",
            "event": "Incorrect added motion sequence entered.",
            "id": "406849f1-b5b1-45e5-8392-1b6c5ed41ca3",
            "photo": "None",
            "session_id": "cb396d4b-b54c-4698-ac54-1ba807f0cdb6"
        },
        {
            "date": "22/03/2023 15:22:51",
            "event": "Incorrect added motion sequence entered.",
            "id": "0be7f5f9-964f-4aa0-962d-e6d7fd8b0fbb",
            "photo": "None",
            "session_id": "1ab2042e-6ce5-470a-9c55-6bd9150bec3c"
        }
    ],
    "msg": "Failed events retrieved.",
    "success": 1
}
```


***Status Code:*** 200

<br>



#### II. Example Request: Email Specific


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Query:***

| Key | Value | Description |
| --- | ------|-------------|
| email | all@email.com |  |



***Body:***

```js        
{
    "auth_session_id": "06c6466b-9c38-4fd3-91c4-73370c941118"
}
```



#### II. Example Response: Email Specific
```js
{
    "events": [
        {
            "date": "22/03/2023 14:39:54",
            "event": "Incorrect added motion sequence entered.",
            "id": "e1d2a58d-7c1f-4b96-bed7-6c5abf47a6e3",
            "photo": "None",
            "session_id": "feb41b52-a4c2-4726-91c2-9e2f6db631a7"
        },
        {
            "date": "22/03/2023 14:44:11",
            "event": "Incorrect added motion sequence entered.",
            "id": "465c0a88-5f36-4c6f-9f7c-896c612cdb3e",
            "photo": "None",
            "session_id": "d6f812a5-f734-4d06-afc4-f6cf24ba5459"
        },
        {
            "date": "22/03/2023 14:46:06",
            "event": "Incorrect added motion sequence entered.",
            "id": "dfca5fdb-ad63-437a-bf74-2fc97bb308ab",
            "photo": "None",
            "session_id": "2ee94d44-c746-4d08-881e-dae5b905bc17"
        },
        {
            "date": "22/03/2023 14:54:38",
            "event": "Incorrect added motion sequence entered.",
            "id": "81906246-f848-402a-85d5-7902ad024db1",
            "photo": "None",
            "session_id": "c8d71676-e81d-41e1-aa93-4ad5e372d6ac"
        },
        {
            "date": "22/03/2023 14:56:55",
            "event": "Incorrect added motion sequence entered.",
            "id": "07142526-7cbd-4e21-aa96-e7e899151fad",
            "photo": "None",
            "session_id": "9874352c-2052-4fe2-bfc6-4f9c7268afb6"
        },
        {
            "date": "22/03/2023 15:10:30",
            "event": "Incorrect added motion sequence entered.",
            "id": "ac4176c5-afe5-4d86-baf6-7769c2354bdc",
            "photo": "None",
            "session_id": "f3fa0429-741c-4e9e-acc1-2deabb3c4c4e"
        },
        {
            "date": "22/03/2023 15:13:48",
            "event": "Incorrect added motion sequence entered.",
            "id": "7b6608a7-8e31-46cc-9d23-b9286abba406",
            "photo": "None",
            "session_id": "e6cfdd0c-b997-4f24-b019-5ec603bc864e"
        },
        {
            "date": "22/03/2023 15:20:14",
            "event": "Incorrect added motion sequence entered.",
            "id": "6675ca84-747c-4f1d-9ac0-1ff1983b60ff",
            "photo": "None",
            "session_id": "74afbd1b-a193-43e0-a0f9-3e1cb95921f6"
        },
        {
            "date": "22/03/2023 15:21:46",
            "event": "Incorrect added motion sequence entered.",
            "id": "406849f1-b5b1-45e5-8392-1b6c5ed41ca3",
            "photo": "None",
            "session_id": "cb396d4b-b54c-4698-ac54-1ba807f0cdb6"
        },
        {
            "date": "22/03/2023 15:22:51",
            "event": "Incorrect added motion sequence entered.",
            "id": "0be7f5f9-964f-4aa0-962d-e6d7fd8b0fbb",
            "photo": "None",
            "session_id": "1ab2042e-6ce5-470a-9c55-6bd9150bec3c"
        }
    ],
    "msg": "Failed events retrieved.",
    "success": 1
}
```


***Status Code:*** 200

<br>



#### III. Example Request: Session ID Specific


***Headers:***

| Key | Value | Description |
| --- | ------|-------------|
| Content-Type | application/json |  |



***Query:***

| Key | Value | Description |
| --- | ------|-------------|
| session_id | feb41b52-a4c2-4726-91c2-9e2f6db631a7 |  |



***Body:***

```js        
{
    "auth_session_id": "06c6466b-9c38-4fd3-91c4-73370c941118"
}
```



#### III. Example Response: Session ID Specific
```js
{
    "events": [
        {
            "date": "22/03/2023 14:39:54",
            "event": "Incorrect added motion sequence entered.",
            "id": "e1d2a58d-7c1f-4b96-bed7-6c5abf47a6e3",
            "photo": "None",
            "session_id": "feb41b52-a4c2-4726-91c2-9e2f6db631a7"
        }
    ],
    "msg": "Failed events retrieved.",
    "success": 1
}
```


***Status Code:*** 200

<br>



### 3. Login


Login to the admin dashboard


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{hostname}}:{{port}}/api/dashboard/login/
```



***Body:***

```js        
{
    "email": "email@domain.com",
    "password": "Password1"
}
```



***More example Requests/Responses:***


#### I. Example Request: Successful



***Body:***

```js        
{
    "email": "user@email.com",
    "password": "Password1"
}
```



#### I. Example Response: Successful
```js
{
    "auth_session_id": "06c6466b-9c38-4fd3-91c4-73370c941118",
    "msg": "Login successful.",
    "success": 1
}
```


***Status Code:*** 200

<br>



#### II. Example Request: Invalid Email / Password



***Body:***

```js        
{
    "email": "",
    "password": "Password1"
}
```



#### II. Example Response: Invalid Email / Password
```js
{
    "msg": "Invalid email or password, please try again.",
    "success": 0
}
```


***Status Code:*** 401

<br>



#### III. Example Request: Not Admin User



***Body:***

```js        
{
    "email": "hi@email.com",
    "password": "Password1"
}
```



#### III. Example Response: Not Admin User
```js
{
    "msg": "You do not have permission to access the dashboard.",
    "success": 0
}
```


***Status Code:*** 403

<br>



### 4. Login Sessions


Get a list of the current and past login sessions


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{hostname}}:{{port}}/api/dashboard/login_sessions/
```



***Body:***

```js        
{
    "auth_session_id": "f57ab88c-04f0-4fe2-a026-c405da71d10a"
}
```



***More example Requests/Responses:***


#### I. Example Request: Successful



***Body:***

```js        
{
    "auth_session_id": "06c6466b-9c38-4fd3-91c4-73370c941118"
}
```



#### I. Example Response: Successful
```js
{
    "msg": "Login sessions retrieved.",
    "sessions": [
        {
            "auth_stages": "{\"password\": true, \"motion_pattern\": true, \"face_recognition\": true}",
            "date": "29/03/2023 23:18:10",
            "login_photo": "b''",
            "motion_added_sequence": "[\"UP\", \"DOWN\", \"RIGHT\"]",
            "motion_completed": true,
            "session_id": "72fe10be-dead-4011-b61b-d44b1496974a",
            "user_email": "user@email.com",
            "user_id": "693e2954-6eb8-4ec6-8906-7b984e06e32e"
        },
        {
            "auth_stages": "{\"password\": true, \"motion_pattern\": true, \"face_recognition\": true}",
            "date": "29/03/2023 22:14:11",
            "login_photo": "b''",
            "motion_added_sequence": "[\"UP\", \"DOWN\", \"RIGHT\"]",
            "motion_completed": true,
            "session_id": "868643d8-cc42-425b-92dc-a17ad11ffd37",
            "user_email": "user@email.com",
            "user_id": "693e2954-6eb8-4ec6-8906-7b984e06e32e"
        },
        {
            "auth_stages": "{\"password\": true, \"motion_pattern\": true, \"face_recognition\": true}",
            "date": "29/03/2023 21:12:48",
            "login_photo": "b''",
            "motion_added_sequence": "[\"UP\", \"DOWN\", \"RIGHT\"]",
            "motion_completed": true,
            "session_id": "e5698965-8674-41c8-aa60-03712d739318",
            "user_email": "user@email.com",
            "user_id": "693e2954-6eb8-4ec6-8906-7b984e06e32e"
        },
        {
            "auth_stages": "{\"password\": true, \"motion_pattern\": true, \"face_recognition\": true}",
            "date": "29/03/2023 21:10:26",
            "login_photo": "b''",
            "motion_added_sequence": "[\"UP\", \"DOWN\", \"RIGHT\"]",
            "motion_completed": true,
            "session_id": "b62cd4ff-c6a7-42b9-a841-8b7f4abb1a2c",
            "user_email": "user@email.com",
            "user_id": "693e2954-6eb8-4ec6-8906-7b984e06e32e"
        },
        {
            "auth_stages": "{\"password\": true, \"motion_pattern\": true, \"face_recognition\": true}",
            "date": "29/03/2023 13:13:10",
            "login_photo": "b''",
            "motion_added_sequence": "[\"UP\", \"DOWN\", \"RIGHT\"]",
            "motion_completed": true,
            "session_id": "bcaf1f84-244d-493a-b953-34a2a3d9fa7c",
            "user_email": "user@email.com",
            "user_id": "693e2954-6eb8-4ec6-8906-7b984e06e32e"
        },
        {
            "auth_stages": "{\"password\": true, \"motion_pattern\": true, \"face_recognition\": true}",
            "date": "29/03/2023 10:43:28",
            "login_photo": "b''",
            "motion_added_sequence": "[\"UP\", \"DOWN\", \"RIGHT\"]",
            "motion_completed": true,
            "session_id": "654c01c0-e9f8-4f66-a6b3-ac46ba5afeda",
            "user_email": "user@email.com",
            "user_id": "693e2954-6eb8-4ec6-8906-7b984e06e32e"
        },
        {
            "auth_stages": "{\"password\": true, \"motion_pattern\": true, \"face_recognition\": true}",
            "date": "29/03/2023 10:11:39",
            "login_photo": "b''",
            "motion_added_sequence": "[\"UP\", \"DOWN\", \"RIGHT\"]",
            "motion_completed": true,
            "session_id": "de62b5ef-f5a2-43a8-89a2-ff578bd30dac",
            "user_email": "user@email.com",
            "user_id": "693e2954-6eb8-4ec6-8906-7b984e06e32e"
        },
        {
            "auth_stages": "{\"password\": true, \"motion_pattern\": true, \"face_recognition\": true}",
            "date": "24/03/2023 23:20:42",
            "login_photo": "b''",
            "motion_added_sequence": "[\"UP\", \"DOWN\", \"RIGHT\"]",
            "motion_completed": true,
            "session_id": "26005122-bf3f-468c-9b27-cc6307354c7c",
            "user_email": "user@email.com",
            "user_id": "693e2954-6eb8-4ec6-8906-7b984e06e32e"
        },
        {
            "auth_stages": "{\"password\": true, \"motion_pattern\": true, \"face_recognition\": true}",
            "date": "24/03/2023 23:15:34",
            "login_photo": "b''",
            "motion_added_sequence": "[\"UP\", \"DOWN\", \"RIGHT\"]",
            "motion_completed": true,
            "session_id": "e605cb8d-1661-4b5a-a8c2-1274a6db7f7c",
            "user_email": "user@email.com",
            "user_id": "693e2954-6eb8-4ec6-8906-7b984e06e32e"
        },
        {
            "auth_stages": "{\"password\": true, \"motion_pattern\": true, \"face_recognition\": false}",
            "date": "24/03/2023 23:07:01",
            "login_photo": "None",
            "motion_added_sequence": "[\"UP\", \"DOWN\", \"RIGHT\"]",
            "motion_completed": true,
            "session_id": "ecbfe6f8-3cf4-4914-93b7-7f07389e9623",
            "user_email": "user@email.com",
            "user_id": "693e2954-6eb8-4ec6-8906-7b984e06e32e"
        },
        {
            "auth_stages": "{\"password\": true, \"motion_pattern\": true, \"face_recognition\": false}",
            "date": "24/03/2023 22:56:08",
            "login_photo": "None",
            "motion_added_sequence": "[\"UP\", \"DOWN\", \"RIGHT\"]",
            "motion_completed": true,
            "session_id": "4f9f4b33-780d-4067-a2c2-9fc2dc3d2a20",
            "user_email": "user@email.com",
            "user_id": "693e2954-6eb8-4ec6-8906-7b984e06e32e"
        }
    ],
    "success": 1
}
```


***Status Code:*** 200

<br>



#### II. Example Request: Count Param



***Query:***

| Key | Value | Description |
| --- | ------|-------------|
| count | 1 |  |



***Body:***

```js        
{
    "auth_session_id": "06c6466b-9c38-4fd3-91c4-73370c941118"
}
```



#### II. Example Response: Count Param
```js
{
    "msg": "Login sessions retrieved.",
    "sessions": [
        {
            "auth_stages": "{\"password\": true, \"motion_pattern\": true, \"face_recognition\": true}",
            "date": "29/03/2023 23:18:10",
            "login_photo": "b''",
            "motion_added_sequence": "[\"UP\", \"DOWN\", \"RIGHT\"]",
            "motion_completed": true,
            "session_id": "72fe10be-dead-4011-b61b-d44b1496974a",
            "user_email": "user@email.com",
            "user_id": "693e2954-6eb8-4ec6-8906-7b984e06e32e"
        }
    ],
    "success": 1
}
```


***Status Code:*** 200

<br>



## Client API



### 1. Login



#### a. Email



***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{hostname}}:{{port}}/api/login/email/
```



***Body:***

```js        
{
    "data": "email@domain.com"
}
```



***More example Requests/Responses:***


##### I. Example Request: Successful



***Body:***

```js        
{
    "data": "postman@email.com"
}
```



##### I. Example Response: Successful
```js
{
    "msg": "Login sequence initialized.",
    "next": "password",
    "session_id": "2c14bef0-6a82-4840-a0f8-3594ca10d141",
    "success": 1
}
```


***Status Code:*** 200

<br>



##### II. Example Request: Email Doesn't Exist / Bad Formatting



***Body:***

```js        
{
    "data": "axoiwmk@lx.al"
}
```



##### II. Example Response: Email Doesn't Exist / Bad Formatting
```js
{
    "msg": "Email not found, please try again.",
    "success": 0
}
```


***Status Code:*** 401

<br>



#### b. Password


Login step with password entry


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{hostname}}:{{port}}/api/login/password/
```



***Body:***

```js        
{
    "session_id": "4de606fb-fc13-4a79-afb4-19c5d09e416a",
    "data": "Password1"
}
```



***More example Requests/Responses:***


##### I. Example Request: Successful



***Body:***

```js        
{
    "session_id": "2c14bef0-6a82-4840-a0f8-3594ca10d141",
    "data": "Password1"
}
```



##### I. Example Response: Successful
```js
{
    "auth_session_id": null,
    "msg": "Password validated.",
    "next": "motion_pattern",
    "success": 1
}
```


***Status Code:*** 200

<br>



##### II. Example Request: Wrong Password



***Body:***

```js        
{
    "session_id": "130b4213-719c-4964-b852-e023d3eacccb",
    "data": "This1smypassword"
}
```



##### II. Example Response: Wrong Password
```js
{
    "msg": "Invalid password, please try again.",
    "success": 0
}
```


***Status Code:*** 401

<br>



#### c. Unique Pico ID


Check the uniqueness of a Pico ID generated


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{hostname}}:{{port}}/api/login/motion_pattern/unique/
```



***Body:***

```js        
{
    "pico_id": "130b4213-719c-4964-b852-e023d3eacccb"
}
```



***More example Requests/Responses:***


##### I. Example Request: Unique



***Body:***

```js        
{
    "pico_id": "2c14bef0-6a82-4840-a0f8-3594ca10d141"
}
```



##### I. Example Response: Unique
```js
{
    "msg": "Pico ID is unique.",
    "success": 1
}
```


***Status Code:*** 200

<br>



##### II. Example Request: Non-Unique



***Body:***

```js        
{
    "pico_id": "130b4213-719c-4964-b852-e023d3eacccb"
}
```



##### II. Example Response: Non-Unique
```js
{
    "msg": "Pico ID is not unique.",
    "success": 0
}
```


***Status Code:*** 400

<br>



#### d. Motion Pattern Initialize


Initiate login step with motion device password


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{hostname}}:{{port}}/api/login/motion_pattern/initialize/
```



***Body:***

```js        
{
    "session_id": "265f92ae-02e5-44d3-b5ae-b3a22d30f924",
    "pico_id": "100b4213-719c-4964-b852-e023d3eacccb",
    "data": [
        "UP", "DOWN"
    ]
}
```



***More example Requests/Responses:***


##### I. Example Request: Successful



***Body:***

```js        
{
    "session_id": "2c14bef0-6a82-4840-a0f8-3594ca10d141",
    "pico_id": "130b4213-719c-4964-b852-e023d3eacccb",
    "data": [
        "UP", "DOWN", "RIGHT"
    ]
}
```



##### I. Example Response: Successful
```js
{
    "auth_session_id": null,
    "msg": "Motion pattern validated.",
    "next": "face_recognition",
    "success": 1
}
```


***Status Code:*** 200

<br>



##### II. Example Request: Expired Session



***Body:***

```js        
{
    "session_id": "2c14bef0-6a82-4840-a0f8-3594ca10d141",
    "pico_id": "",
    "data": [
        "UP", "DOWN", "RIGHT"
    ]
}
```



##### II. Example Response: Expired Session
```js
{
    "msg": "Session expired, please start a new login session.",
    "next": "email",
    "success": 0
}
```


***Status Code:*** 401

<br>



##### III. Example Request: Wrong Stage



***Body:***

```js        
{
    "session_id": "25e2bf8f-ae6d-4f06-8c39-e48c887af856",
    "pico_id": "120b4213-719c-4964-b852-e023d3eacccb",
    "data": [
        "UP", "DOWN", "RIGHT"
    ]
}
```



##### III. Example Response: Wrong Stage
```js
{
    "msg": "Wrong stage of login sequence, please go to specified stage.",
    "next": "password",
    "success": 0
}
```


***Status Code:*** 400

<br>



##### IV. Example Request: Incorrect Pattern



***Body:***

```js        
{
    "session_id": "25e2bf8f-ae6d-4f06-8c39-e48c887af856",
    "pico_id": "120b4213-719c-4964-b852-e023d3eacccb",
    "data": [
        "UP", "DOWN", "RIGHT"
    ]
}
```



##### IV. Example Response: Incorrect Pattern
```js
{
    "msg": "Motion pattern incorrect, please retry.",
    "success": 0
}
```


***Status Code:*** 401

<br>



#### e. Motion Pattern Validate


Motion device password submission endpoint


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{hostname}}:{{port}}/api/login/motion_pattern/validate/
```



***Body:***

```js        
{
    "pico_id": "100b4213-719c-4964-b852-e023d3eacccb",
    "data": [
        "LEFT", "RIGHT", "UP", "FLIP", "UP", "DOWN"
    ]
}
```



***More example Requests/Responses:***


##### I. Example Request: Incorrect Pattern



***Body:***

```js        
{
    "pico_id": "120b4213-719c-4964-b852-e023d3eacccb",
    "data": [
        "LEFT", "RIGHT", "UP", "DOWN", "UP", "DOWN"
    ]
}
```



##### I. Example Response: Incorrect Pattern
```js
{
    "msg": "Incorrect motion pattern, please try again.",
    "success": 0
}
```


***Status Code:*** 401

<br>



##### II. Example Request: Successful



***Body:***

```js        
{
    "pico_id": "110b4213-719c-4964-b852-e023d3eacccb",
    "data": [
        "LEFT", "RIGHT", "UP", "DOWN", "UP", "DOWN", "RIGHT"
    ]
}
```



##### II. Example Response: Successful
```js
{
    "msg": "Motion pattern validated.",
    "success": 1
}
```


***Status Code:*** 200

<br>



#### f. Face Recognition


Login step with face recognition


***Endpoint:***

```bash
Method: POST
Type: FORMDATA
URL: {{hostname}}:{{port}}/api/login/face_recognition/
```



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | {"session_id": "a8956a59-8759-408d-8b7f-e74cfe213083"} |  |
| photo |  |  |



***More example Requests/Responses:***


##### I. Example Request: Successful



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | {"session_id": "2c14bef0-6a82-4840-a0f8-3594ca10d141"} |  |
| photo |  |  |



##### I. Example Response: Successful
```js
{
    "auth_session_id": "e78ace29-54c7-4dfa-baa9-815d6288e5c6",
    "msg": "Face recognition validated.",
    "next": null,
    "success": 1
}
```


***Status Code:*** 200

<br>



##### II. Example Request: Missing Photo



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | {"session_id": "6f445663-3bc6-49b2-bf97-3fa0c5f5e2d9"} |  |



##### II. Example Response: Missing Photo
```js
{
    "msg": "No photo submitted, please try again.",
    "success": 0
}
```


***Status Code:*** 400

<br>



### 2. Files



#### a. Upload File


Upload a file to the authenticated client's account


***Endpoint:***

```bash
Method: POST
Type: FORMDATA
URL: {{hostname}}:{{port}}/api/client/files/upload/
```



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | <pre>{<br>    "auth_session_id": "6a8dc068-f2da-4afe-bb0e-0b03ab899fe3",<br>    "file_name": "Example File"<br>}</pre> |  |
| file | fileName.extension |  |



***More example Requests/Responses:***


##### I. Example Request: Successful



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | <pre>{<br>    "auth_session_id": "3e2dd9ab-03dd-4f8f-9b0d-80e77c35fc78",<br>    "file_name": "picture"<br>}</pre> |  |
| file | photo.jpg |  |



##### I. Example Response: Successful
```js
{
    "msg": "File upload successful.",
    "success": 1
}
```


***Status Code:*** 200

<br>



##### II. Example Request: Invalid ID



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | <pre>{<br>    "auth_session_id": "b62cd4ff-c6a7-42b9-a841-8b7f4abb1a2c",<br>    "file_name": "picture"<br>}</pre> |  |
| file | file.txt |  |



##### II. Example Response: Invalid ID
```js
{
    "msg": "Invalid auth_session_id, please try again.",
    "success": 0
}
```


***Status Code:*** 401

<br>



##### III. Example Request: Wrong Body Type



***Body:***

```js        
{
    "auth_session_id": "3e2dd9ab-03dd-4f8f-9b0d-80e77c35fc78"
}
```



##### III. Example Response: Wrong Body Type
```js
{
    "msg": "Missing multipart form data in request.",
    "success": 0
}
```


***Status Code:*** 400

<br>



##### IV. Example Request: Duplicate File Name



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | <pre>{<br>    "auth_session_id": "3e2dd9ab-03dd-4f8f-9b0d-80e77c35fc78",<br>    "file_name": "picture"<br>}</pre> |  |
| file | file.txt |  |



##### IV. Example Response: Duplicate File Name
```js
{
    "msg": "File name already exists.",
    "success": 0
}
```


***Status Code:*** 400

<br>



#### b. List Files


List the files on the authenticated client's account


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{hostname}}:{{port}}/api/client/files/list/
```



***Body:***

```js        
{
    "auth_session_id": "6a8dc068-f2da-4afe-bb0e-0b03ab899fe3"
}
```



***More example Requests/Responses:***


##### I. Example Request: Successful



***Body: None***



##### I. Example Response: Successful
```js
{
    "json": [
        {
            "date": "2023-03-29 22:50:13",
            "file_name": "picture",
            "file_type": "image/jpeg",
            "id": "aa35b09c-ddec-425f-acf4-442ead625aeb",
            "size": 1859839
        },
        {
            "date": "2023-03-29 22:50:24",
            "file_name": "picture2",
            "file_type": "image/jpeg",
            "id": "7093be37-dd7e-48e4-b0bd-33da2731eb4b",
            "size": 1397795
        }
    ],
    "msg": "File fetch successful.",
    "success": 1
}
```


***Status Code:*** 200

<br>



#### c. File Download


Download a file from the authenticated client's account


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{hostname}}:{{port}}/api/client/files/download/
```



***Body:***

```js        
{
    "auth_session_id": "dcec7f7b-64ab-4581-911f-8c2e458c4269",
    "file_id": "aa56d109-ee59-401f-84dd-ac386d28c3ac"
}
```



#### d. Delete File


Delete a file on the authenticated client's account


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{hostname}}:{{port}}/api/client/files/delete/
```



***Body:***

```js        
{
    "auth_session_id": "6a8dc068f2da4afebb0e0b03ab899fe3",
    "file_id": "aa35b09c-ddec-425f-acf4-442ead625aeb"
}
```



### 3. Index


Index route of the API


***Endpoint:***

```bash
Method: GET
Type: 
URL: {{hostname}}:{{port}}/api/
```



***More example Requests/Responses:***


#### I. Example Request: Success



***Body: None***



#### I. Example Response: Success
```js
Hello, world!
```


***Status Code:*** 200

<br>



### 4. Signup


Client sign-up endpoint


***Endpoint:***

```bash
Method: POST
Type: FORMDATA
URL: {{hostname}}:{{port}}/api/signup/
```



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | <pre>{<br>    "email": "email@domain.com",<br>    "password": "Password1",<br>    "motion_pattern": ["LEFT", "RIGHT", "UP", "DOWN"],<br>    "auth_methods": {<br>        "password": true,<br>        "motion_pattern": true,<br>        "face_recognition": true<br>    }<br>}</pre> |  |
| photo | photo.png |  |



***More example Requests/Responses:***


#### I. Example Request: Successful



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | <pre>{<br>    "email": "postman@email.com",<br>    "password": "Password1",<br>    "motion_pattern": ["LEFT", "RIGHT", "UP", "DOWN"],<br>    "auth_methods": {<br>        "password": true,<br>        "motion_pattern": true,<br>        "face_recognition": true<br>    }<br>}</pre> |  |
| photo | photo.png |  |



#### I. Example Response: Successful
```js
{
    "msg": "User successfully created.",
    "success": 1
}
```


***Status Code:*** 200

<br>



#### II. Example Request: Require An Auth Method



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | <pre>{<br>    "email": "postman-fail@email.com",<br>    "password": "Password1",<br>    "motion_pattern": ["LEFT", "RIGHT", "UP", "DOWN"],<br>    "auth_methods": {<br>        "password": false,<br>        "motion_pattern": false,<br>        "face_recognition": false<br>    }<br>}</pre> |  |
| photo | photo.png |  |



#### II. Example Response: Require An Auth Method
```js
{
    "msg": "Error: At least one auth method must be enabled. User not created.",
    "success": 0
}
```


***Status Code:*** 400

<br>



#### III. Example Request: Duplicate Email



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | <pre>{<br>    "email": "postman@email.com",<br>    "password": "Password1",<br>    "motion_pattern": ["LEFT", "RIGHT", "UP", "DOWN"],<br>    "auth_methods": {<br>        "password": false,<br>        "motion_pattern": true,<br>        "face_recognition": false<br>    }<br>}</pre> |  |
| photo | |  |



#### III. Example Response: Duplicate Email
```js
{
    "msg": "Error: Provided email is already in use. User not created.",
    "success": 0
}
```


***Status Code:*** 400

<br>



#### IV. Example Request: Missing Password (When Enabled)



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | <pre>{<br>    "email": "postman-fail@email.com",<br>    "motion_pattern": ["LEFT", "RIGHT", "UP", "DOWN"],<br>    "auth_methods": {<br>        "password": true,<br>        "motion_pattern": true,<br>        "face_recognition": true<br>    }<br>}</pre> |  |
| photo | photo.png |  |



#### IV. Example Response: Missing Password (When Enabled)
```js
{
    "msg": "Error: Password not provided. User not created.",
    "success": 0
}
```


***Status Code:*** 400

<br>



#### V. Example Request: Missing Motion Pattern (When Enabled)



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | <pre>{<br>    "email": "postman-fail@email.com",<br>    "password": "Password1",<br>    "auth_methods": {<br>        "password": true,<br>        "motion_pattern": true,<br>        "face_recognition": true<br>    }<br>}</pre> |  |
| photo | photo.png |  |



#### V. Example Response: Missing Motion Pattern (When Enabled)
```js
{
    "msg": "Error: Motion pattern not provided. User not created.",
    "success": 0
}
```


***Status Code:*** 400

<br>



#### VI. Example Request: Missing Photo (When Enabled)



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | <pre>{<br>    "email": "postman-fail@email.com",<br>    "password": "Password1",<br>    "motion_pattern": ["LEFT", "RIGHT", "UP", "DOWN"],<br>    "auth_methods": {<br>        "password": true,<br>        "motion_pattern": true,<br>        "face_recognition": true<br>    }<br>}</pre> |  |
| photo | |  |



#### VI. Example Response: Missing Photo (When Enabled)
```js
{
    "msg": "Error: No photo submitted. User not created.",
    "success": 0
}
```


***Status Code:*** 400

<br>



#### VII. Example Request: Invalid Motion Pattern



***Body:***

| Key | Value | Description |
| --- | ------|-------------|
| request | <pre>{<br>    "email": "postman-fail@email.com",<br>    "password": "Password1",<br>    "motion_pattern": ["left", "RIGHT", "UP", "DOWN"],<br>    "auth_methods": {<br>        "password": true,<br>        "motion_pattern": true,<br>        "face_recognition": false<br>    }<br>}</pre> |  |
| photo | |  |



#### VII. Example Response: Invalid Motion Pattern
```js
{
    "msg": "Error: Invalid motion pattern. User not created.",
    "success": 0
}
```


***Status Code:*** 400

<br>



### 5. Check Login


Check the validity of a session token


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{hostname}}:{{port}}/api/client/validate/
```



***Body:***

```js        
{
    "auth_session_id": "121a9cd7e3b540f396c0936bd22a1a8c"
}
```



***More example Requests/Responses:***


#### I. Example Request: Invalid ID



***Body:***

```js        
{
    "auth_session_id": "a48b506f-c58d-4c72-b826-8b2db8376816"
}
```



#### I. Example Response: Invalid ID
```js
{
    "msg": "Invalid auth_session_id, please try again.",
    "success": 0
}
```


***Status Code:*** 401

<br>



#### II. Example Request: Valid ID



***Body:***

```js        
{
    "auth_session_id": "e78ace29-54c7-4dfa-baa9-815d6288e5c6"
}
```



#### II. Example Response: Valid ID
```js
{
    "msg": "Auth session ID is valid.",
    "success": 1
}
```


***Status Code:*** 200

<br>



#### III. Example Request: Expired Session / Logged Out



***Body:***

```js        
{
    "auth_session_id": "9122b7bbd56147b1a1a99c522c4350f0"
}
```



#### III. Example Response: Expired Session / Logged Out
```js
{
    "msg": "Session expired, please start a new login session.",
    "next": "email",
    "success": 0
}
```


***Status Code:*** 401

<br>



### 6. Logout


Logout the authenticated client


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: {{hostname}}:{{port}}/api/client/logout
```



***Body:***

```js        
{
    "auth_session_id": "9522b7bbd56147b1a1a99c522c4350f0"
}
```



***More example Requests/Responses:***


#### I. Example Request: Successful



***Body:***

```js        
{
    "auth_session_id": "9122b7bbd56147b1a1a99c522c4350f0"
}
```



#### I. Example Response: Successful
```js
{
    "msg": "Logout successful.",
    "success": 1
}
```


***Status Code:*** 200

<br>



#### II. Example Request: Invalid ID



***Body:***

```js        
{
    "auth_session_id": "9522b7bbd56147b1a1a99c522c4350f0"
}
```



#### II. Example Response: Invalid ID
```js
{
    "msg": "Invalid auth_session_id, please try again.",
    "success": 0
}
```


***Status Code:*** 401

<br>



## Pico API

API of the Pico device (not in the backend)



### 1. Set Pico ID


Set the unique identifier for the Pico's requests


***Endpoint:***

```bash
Method: POST
Type: RAW
URL: http://192.168.137.159/pico_id
```



***Body:***

```js        
{
    "pico_id": "9522b7bbd56147b1a1a99c522c4350f0"
}
```



---
[Back to top](#3fa)
