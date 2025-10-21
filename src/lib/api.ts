// Create Axios API client with JWT interceptors and helpers
import axios, { AxiosError } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
})

// Simple token storage; can be swapped with more secure storage when needed
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export function getAccessToken(): string | null {
	return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setTokens(tokens: { access?: string; refresh?: string }) {
	if (tokens.access) localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
	if (tokens.refresh) localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
}

export function clearTokens() {
	localStorage.removeItem(ACCESS_TOKEN_KEY)
	localStorage.removeItem(REFRESH_TOKEN_KEY)
}

api.interceptors.request.use((config) => {
	const token = getAccessToken()
	if (token) {
		config.headers = config.headers ?? {}
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

function onTokenRefreshed(token: string) {
	pendingRequests.forEach((cb) => cb(token))
	pendingRequests = []
}

api.interceptors.response.use(
	(res) => res,
	async (error: AxiosError) => {
		const original = error.config as any
		if (error.response?.status === 401 && !original?._retry) {
			const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)
			if (!refresh) {
				clearTokens()
				return Promise.reject(error)
			}
			if (isRefreshing) {
				return new Promise((resolve) => {
					pendingRequests.push((token: string) => {
						original.headers = original.headers ?? {}
						original.headers.Authorization = `Bearer ${token}`
						resolve(api(original))
					})
				})
			}
			isRefreshing = true
			try {
				const { data } = await axios.post(
					`${API_BASE_URL.replace(/\/$/, '')}/auth/refresh/`,
					{ refresh },
					{ withCredentials: true }
				)
				setTokens({ access: (data as any).access })
				onTokenRefreshed((data as any).access)
				original._retry = true
				original.headers = original.headers ?? {}
				original.headers.Authorization = `Bearer ${(data as any).access}`
				return api(original)
			} catch (e) {
				clearTokens()
				return Promise.reject(e)
			} finally {
				isRefreshing = false
			}
		}
		return Promise.reject(error)
	}
)

export type LoginResponse = { access: string; refresh: string }

export const AuthAPI = {
	login: (payload: { email: string; password: string }) =>
		api.post<LoginResponse>('/auth/login/', payload).then((r) => r.data),
	register: (payload: {
		email: string
		first_name: string
		last_name?: string
		password: string
	}) => api.post('/auth/register/', payload).then((r) => r.data),
}

export type PostListItem = {
	id: number
	title: string
	slug: string
	short_description: string
	cover_image: string | null
	created_at: string
	updated_at: string
}

export type PostDetail = {
	id: number
	title: string
	slug: string
	category: number | null
	short_description: string
	content: Record<string, any>
	cover_image: string | null
	author: number
	status: string
	created_at: string
	updated_at: string
}

export const PostsAPI = {
	list: (params?: { search?: string; ordering?: string; category__slug?: string }) =>
		api
			.get<PostListItem[]>('/posts/client/', { params })
			.then((r) => r.data),
	detail: (slug: string) => api.get<PostDetail>(`/posts/client/${slug}/`).then((r) => r.data),
	mine: () => api.get<PostListItem[]>('/posts/author/mine/').then((r) => r.data),
	create: (payload: Partial<PostDetail>) => api.post('/posts/author/', payload).then((r) => r.data),
	update: (slug: string, payload: Partial<PostDetail>) =>
		api.patch(`/posts/author/${slug}/`, payload).then((r) => r.data),
}

export type Category = { id: number; name: string; description?: string | null }
export const CategoriesAPI = {
	list: () => api.get<Category[]>('/category/categories/').then((r) => r.data),
}
