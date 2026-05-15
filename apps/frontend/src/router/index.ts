import { createRouter, createWebHashHistory } from "vue-router";
import BlogListView from "@/views/BlogListView.vue";
import BlogPostView from "@/views/BlogPostView.vue";
import BookmarksView from "@/views/BookmarksView.vue";
import LoginView from "@/views/LoginView.vue";
import MyPostsView from "@/views/MyPostsView.vue";
import PostCreateView from "@/views/PostCreateView.vue";
import PostEditView from "@/views/PostEditView.vue";
import ProfileView from "@/views/ProfileView.vue";
import RegisterView from "@/views/RegisterView.vue";

const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{ path: "/", redirect: "/blog" },
		{ path: "/blog", component: BlogListView },
		{ path: "/blog/:slug", component: BlogPostView },
		{ path: "/login", component: LoginView },
		{ path: "/register", component: RegisterView },
		{
			path: "/me",
			component: ProfileView,
			meta: { requiresAuth: true },
		},
		{
			path: "/me/posts",
			component: MyPostsView,
			meta: { requiresAuth: true },
		},
		{
			path: "/me/posts/new",
			component: PostCreateView,
			meta: { requiresAuth: true },
		},
		{
			path: "/me/posts/:slug/edit",
			component: PostEditView,
			meta: { requiresAuth: true },
		},
		{
			path: "/me/bookmarks",
			component: BookmarksView,
			meta: { requiresAuth: true },
		},
	],
});

router.beforeEach((to) => {
	const token = localStorage.getItem("accessToken");
	if (to.meta.requiresAuth && !token) return "/login";
});

export default router;
