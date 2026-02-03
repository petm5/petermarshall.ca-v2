import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
	plugins: [
		sveltekit(),
		enhancedImages()
	],
	build: {
		assetsInlineLimit: 0
	},
	define: {
		BUILD_DATE: Date.now()
	}
});
