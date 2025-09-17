import { createRouter, createWebHistory } from 'vue-router'

const DashboardLayout = () => import('@/layouts/DashboardLayout.vue')
const DashboardHome   = () => import('@/views/DashboardHome.vue')
const CalendarPage    = () => import('@/views/CalendarPage.vue')
const SettingPage     = () => import('@/views/SettingPage.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: DashboardLayout,
      children: [
        { path: '', name: 'home', component: DashboardHome },
        { path: 'calendar', name: 'calendar', component: CalendarPage },
        { path: 'settings', name: 'settings', component: SettingPage },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
