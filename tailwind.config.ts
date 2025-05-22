const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
  },
  plugins: [require("tailwindcss-animate")],
  corePlugins: {
    // Make sure backdropBlur is not disabled
    // If you're not customizing corePlugins, you can omit this section
    backdropBlur: true,
  },
};
