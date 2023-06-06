module.exports = {
  packagerConfig: {
    icon: "./public/app/app_icon",
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-webpack",
      config: {
        devContentSecurityPolicy: `connect-src 'self' http://192.168.137.1:5000 https://192.168.137.1:5000 https://127.0.0.1:5000 http://127.0.0.1:5000 http://192.168.137.159 http://192.168.12.159 https://3fa.bxian03.systems`,
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/index.html",
              js: "./src/renderer.js",
              name: "main_window",
              preload: {
                js: "./src/preload.js",
              },
            },
          ],
        },
      },
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "Computing-Collective",
          name: "3FA",
        },
        prerelease: false,
      },
    },
  ],
};
