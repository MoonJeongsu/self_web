// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2024-11-01',
	devtools: { enabled: false },
	runtimeConfig: {
		public: {
			apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://43.201.9.18:8082/smart-jaga-api',
		},
	},
	ignoreOptions: {
		allowRelativePaths: true,
	},
	ssr: true, // Default is true
	components: [
		{
			path: '~/components',
			pathPrefix: true,
		},
	], 
	modules: [
		'@nuxt/ui',
		'@samk-dev/nuxt-vcalendar',
	],
	app: {
		head: {
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
			title: '스마트 자가진단',
			link: [
				{
					rel: 'stylesheet',
					href: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css',
					integrity: 'sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD',
					crossorigin: 'anonymous'
				}
			],
			script: [
				{
					src: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js',
					integrity: 'sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN',
					crossorigin: 'anonymous'
				},
				{src: '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'}
			],
		}
	}
})
