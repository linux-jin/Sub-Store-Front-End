import { useEnvApi } from '@/api/env'
import { useSubsApi } from '@/api/subs'

import AppLayout from '@/layout/AppLayout.vue'
import { useGlobalStore } from '@/store/global'
import { initStores } from '@/utils/initApp'
import My from '@/views/My.vue'
import NotFound from '@/views/NotFound.vue'

import Sub from '@/views/Sub.vue'
import SubEditor from '@/views/SubEditor.vue'

import Sync from '@/views/Sync.vue'
// import themeSetting from '@/views/themeSetting.vue';
import moreSetting from '@/views/settings/moreSetting.vue'
import { Toast } from '@nutui/nutui'
import { toRaw } from 'vue'
import 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import aboutUs from '@/views/settings/AboutUs.vue'
import APISetting from '@/views/settings/APISetting.vue'
import Login from '@/views/Login.vue'
// import { SwipeBack } from 'vue-swipe-back'

let globalStore = null

declare module 'vue-router' {
	interface RouteMeta {
		title: string
		needTabBar: boolean
		needNavBack: boolean
	}
}

const history = createWebHistory()
const router = createRouter({
	history,
	routes: [
		{
			path: '/sub',
			component: AppLayout,
			redirect: '/subs',
			children: [
				{
					path: '/subs',
					component: Sub,
					meta: {
						title: 'sub',
						needTabBar: true,
						needNavBack: false
					}
				},
				{
					path: '/sync',
					component: Sync,
					meta: {
						title: 'sync',
						needTabBar: true,
						needNavBack: false
					}
				},
				{
					path: '/my',
					component: My,
					meta: {
						title: 'my',
						needTabBar: true,
						needNavBack: false
					}
				},
				{
					path: '/edit/:editType(subs|collections)/:id',
					component: SubEditor,
					meta: {
						title: 'subEditor',
						needTabBar: false,
						needNavBack: true
					}
				},
				// {
				//   path: '/settings/theme',
				//   component: themeSetting,
				//   meta: {
				//     title: 'themeSetting',
				//     needTabBar: false,
				//     needNavBack: true,
				//   },
				// },
				{
					path: '/settings/more',
					component: moreSetting,
					meta: {
						title: 'moreSetting',
						needTabBar: false,
						needNavBack: true
					}
				},
				{
					path: '/settings/api',
					component: APISetting,
					meta: {
						title: 'apiSetting',
						needTabBar: false,
						needNavBack: true
					}
				},
				{
					path: '/aboutUs',
					component: aboutUs,
					meta: {
						title: 'aboutUs',
						needTabBar: false,
						needNavBack: true
					}
				}
			]
		},
		{
			path: '/404',
			component: NotFound,
			meta: {
				title: 'notFound',
				needTabBar: false,
				needNavBack: true
			}
		},
		{
			path: '/:pathMatch(.*)',
			component: NotFound,
			meta: {
				title: 'notFound',
				needTabBar: false,
				needNavBack: true
			}
		},
		{
			path: '/',
			component: Login,
			meta: {
				title: 'login',
				needTabBar: false,
				needNavBack: false
			}
		}
	]
})

// 全局前置守卫
router.beforeResolve(async (to) => {
	// 路由跳转时查询环境，决定是否更新数据
	if (globalStore !== null) {
		useEnvApi()
			.getEnv()
			.then(async (res) => {
				const envNow = res
				const storeEnv = toRaw(globalStore.env)
				if (envNow?.data?.status === 'success') {
					const backend = envNow.data.data.backend
					const version = envNow.data.data.version
					const hasNewVersion = envNow.data.data.hasNewVersion
					const latestVersion = envNow.data.data.latestVersion
					if (backend !== storeEnv.backend || version !== storeEnv.version) {
						Toast.loading('检测到后端变化，更新数据中...', {
							cover: true,
							id: 'fetchLoading'
						})
						await initStores(false, true, true)
						Toast.hide('fetchLoading')
					}
				}
			})
	} else {
		globalStore = useGlobalStore()
	}

	// 进入编辑页面前查询是否存在订阅
	if (to.fullPath.startsWith('/edit/')) {
		const name = to.params.id as string
		if (name !== 'UNTITLED') {
			try {
				if (to.params.editType === 'subs') {
					await useSubsApi().getOne('sub', name)
				} else if (to.params.editType === 'collections') {
					await useSubsApi().getOne('collection', name)
				}
			} catch {
				router.replace('/404')
			}
		}
	}

	// 允许跳转
	return true
})

router.beforeEach((to, from, next) => {
	// let token = window.localStorage.getItem('token')
	// let type = window.localStorage.getItem('type')
	if (to.path === '/' || to.path === '/login' || to.path === '/error') {
		// console.log("允许直接访问")
		next()
	} else {
		// let token = window.localStorage.getItem('token') // 长期存储
		let token = window.sessionStorage.getItem('token') // 临时存储，关闭标签后就清除
		// console.log("需要token")
		if (token === null || token === '' || token !== import.meta.env.VITE_TOKEN) {
			// console.log("无token，跳转登录")
			next('/')
		} else {
			// console.log("有token")
			next()
		}
	}
})

export default router
