import { defineNuxtPlugin } from '#app'
import type { DirectiveBinding } from 'vue'

const clickOutsideDirective = {
	// Vue 3에서는 beforeMount, mounted, updated, unmounted 등 lifecycle 훅으로 작성
	beforeMount(el: any, binding: DirectiveBinding) {
		el.clickOutsideEvent = (event: Event) => {
		if (!(el === event.target || el.contains(event.target as Node))) {
			// binding.value에 함수를 전달해두면, 여기서 호출
			binding.value(event)
		}
		}
		document.addEventListener('click', el.clickOutsideEvent)
	},
	unmounted(el: any) {
		document.removeEventListener('click', el.clickOutsideEvent)
	},
}

export default defineNuxtPlugin((nuxtApp) => {
  	nuxtApp.vueApp.directive('click-outside', clickOutsideDirective)
})