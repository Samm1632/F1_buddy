import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
	plugins: [vue()],
	server: {
		host: true,
		port: 5173,
		strictPort: true,
		proxy: {
			'/api': { target: 'http://localhost:3001', changeOrigin: true },
		},
	},
});