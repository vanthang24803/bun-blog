import { createRouter, createWebHashHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";

const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{ path: "/", redirect: "/login" },
		{ path: "/login", component: LoginView },
		{ path: "/register", component: RegisterView },
		{
			path: "/dashboard",
			component: DashboardView,
			meta: { requiresAuth: true },
		},
	],
});

router.beforeEach((to) => {
	const token = localStorage.getItem("accessToken");
	if (to.meta.requiresAuth && !token) return "/login";
});

export default router;
