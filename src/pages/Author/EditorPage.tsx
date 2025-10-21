import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CategoriesAPI, PostsAPI } from '../../lib/api'
import { Editor } from '../../components/Editor'
import { useNavigate, useParams } from 'react-router-dom'

export default function EditorPage() {
	const { slug } = useParams()
	const navigate = useNavigate()
	const qc = useQueryClient()
	const isEdit = !!slug

	const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: CategoriesAPI.list })
	const { data: existing } = useQuery({
		queryKey: ['post', slug],
		queryFn: () => PostsAPI.detail(slug!),
		enabled: isEdit,
	})

	const [title, setTitle] = useState('')
	const [shortDescription, setShortDescription] = useState('')
	const [category, setCategory] = useState<number | ''>('' as any)
	const [content, setContent] = useState<Record<string, any>>({ blocks: [] })

	useEffect(() => {
		if (existing) {
			setTitle(existing.title)
			setShortDescription(existing.short_description)
			setCategory((existing.category as any) || '')
			setContent(existing.content || { blocks: [] })
		}
	}, [existing])

	const saveMutation = useMutation({
		mutationFn: async () => {
			const payload = {
				title,
				short_description: shortDescription,
				category: category || null,
				content,
			}
			if (isEdit) return PostsAPI.update(slug!, payload)
			return PostsAPI.create(payload as any)
		},
		onSuccess: (data: any) => {
			qc.invalidateQueries({ queryKey: ['author', 'mine'] })
			navigate(isEdit ? `/author` : `/author/edit/${data.slug}`)
		},
	})

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">{isEdit ? 'Edit post' : 'New post'}</h1>
				<button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="rounded-lg bg-brand-600 text-white px-4 py-2 font-medium">
					{saveMutation.isPending ? 'Saving...' : 'Save'}
				</button>
			</div>
			<div className="grid gap-6">
				<input
					placeholder="Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-4 py-3 text-xl font-semibold"
				/>
				<textarea
					placeholder="Short description"
					value={shortDescription}
					onChange={(e) => setShortDescription(e.target.value)}
					className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-4 py-3"
					rows={3}
				/>
				<select
					value={category}
					onChange={(e) => setCategory(e.target.value ? Number(e.target.value) : '' as any)}
					className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-4 py-3"
				>
					<option value="">No category</option>
					{categories?.map((c) => (
						<option key={c.id} value={c.id}>{c.name}</option>
					))}
				</select>
				<Editor value={content as any} onChange={(d) => setContent(d as any)} />
			</div>
		</div>
	)
}
