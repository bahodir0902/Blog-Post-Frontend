import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PostsAPI } from '../../lib/api'

export default function Dashboard() {
	const { data, isLoading } = useQuery({ queryKey: ['author', 'mine'], queryFn: PostsAPI.mine })
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Your posts</h1>
				<Link to="/author/new" className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium">New Post</Link>
			</div>
			{isLoading && <div>Loading...</div>}
			<div className="space-y-3">
				{data?.map((p) => (
					<Link key={p.slug} to={`/author/edit/${p.slug}`} className="block p-4 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 hover:shadow-soft">
						<div className="font-medium">{p.title}</div>
						<div className="text-sm text-gray-600 dark:text-neutral-300 line-clamp-2">{p.short_description}</div>
					</Link>
				))}
			</div>
		</div>
	)
}
