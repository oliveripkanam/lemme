import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2C5B43',
          light: '#3A7057',
          dark: '#234835',
        },
        beige: {
          DEFAULT: '#F5F2EA',
          light: '#FAF8F3',
          dark: '#E8E4D9',
        },
      },
    },
  },
  plugins: [],
}

export default config 