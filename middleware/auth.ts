export default defineNuxtRouteMiddleware((to, from) => {
    //// 현재 없는 상태로 제거 ////
    // const accessToken = useCookie('accessToken').value;
    // if (!accessToken && to.path !== '/login') {
    //     return navigateTo('/login'); // 토큰이 없으면 로그인 페이지로 이동
    // }
});