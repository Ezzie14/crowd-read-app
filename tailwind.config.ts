import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F2E9D8',
        ink: '#1C1A17',
        green: {
          DEFAULT: '#0F3D2E',
          deep: '#0A2A20'
        },
        gold: {
          DEFAULT: '#C99A2E',
          light: '#E3BE5C'
        },
        rip: '#B23A2F'
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)']
      },
      letterSpacing: {
        board: '0.04em'
      }
    }
  },
  plugins: []
};
export default config;
