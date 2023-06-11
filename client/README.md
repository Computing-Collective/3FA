[![fork with dotenv-vault](https://badge.dotenv.org/fork.svg?r=1)](https://vault.dotenv.org/project/vlt_a040e01957b91d55ee0204f2b609687f107de5e388dc9eb3bf2bc779e8537458/example)

# Client Frontend

An electron app with 3 layers of authentication that you can opt-into which includes a regular password, a motion-sensor password, and a facial recognition system. The algorithms for all of these were developed by us and allow you to securely access your account. The app allows you to interact with our cloud-based storage, allowing you to upload, download, and delete things from your own storage which are isolated to each account.

## Technologies Used

We used Electron Forge to quickly design, develop, and publish our cross-platform app. In order to help our development, we used `React.js` to create reuseable components and to route our pages so that some pages require your authentication to access. In additon, we used `TailwindCSS` to quickly design and use styles. Lastly, we used `Webpack` as our module bundler to reduce the overall package size.

## Running Instructions

1. Fork the repository with `dotenv` to obtain a `.env.example` to place the server API endpoint & the IP address of the Pico Microcontroller for sensor inputs 
   a. In `forge.config.js` find `devContentSecurityPolicy` and add the hostnames that you added to this field.

2. Install dependencies with `npm i`

3. Run with `npm start` to launch in development mode

## Packaging Instructions

1. Run `npm run make` on your target platform which will create a distributable in the `./out/3FA` folder

