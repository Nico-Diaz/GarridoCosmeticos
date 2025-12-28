// @ts-check
import { defineConfig } from 'astro/config';

import preact from '@astrojs/preact';

import vercel from '@astrojs/vercel';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [preact(), react()],
  adapter: vercel()
});