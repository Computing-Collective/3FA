# Client Frontend

An electron app with 3 layers of authentication that you can opt-into which includes a regular password, a motion-sensor password, and a facial recognition system. The algorithms for all of these were developed by us and allow you to securely access your account. The app allows you to interact with our cloud-based storage, allowing you to upload, download, and delete things from your own storage which are isolated to each account.

## Technologies Used

We used Electron Forge to quickly design, develop, and publish our cross-platform app. In order to help our development, we used `React.js` to create reuseable components and to route our pages so that some pages require your authentication to access. In additon, we used `TailwindCSS` to quickly design and use styles. Lastly, we used `Webpack` as our module bundler to reduce the overall package size.

## Running Instructions

1. Install dependencies with `npm i`

2. Modify the [`main.js`](/client/src/main.js) and [`preload.js`](/client/src/preload.js) files with your preferred hostnames (or leave them as is to use our deployed backend). Then, in [`forge.config.js`](/client/forge.config.js) find `devContentSecurityPolicy` and add the hostnames that you added to this field.
   - `API_ENDPOINT = <SERVER_API_ENDPOINT>`. This is the address for the backend server. 
   - `PICO_API_ENDPOINT = <PICO IP ADDRESS>` where Pico IP address is the address to connect with the Pico microcontroller.

3. Run `npm start` to launch the application in development mode

## Packaging Instructions

1. Run `npm run make` on your target platform which will create a distributable in the `./out/3FA` folder

