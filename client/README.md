# Client Frontend

### Running Instructions

1. Install dependencies with `npm i`

2. Modify the `.env.example` file to the new hostnames. Rename the file from `.env.example` to `.env`.
   a. In `forge.config.js` find `devContentSecurityPolicy` and add the hostnames that you added to this field.

3. Run with `npm start`

### Packaging Instructions

1. Run `npm run make` on your target platform which will create a distributable in the `./out/3FA` folder
