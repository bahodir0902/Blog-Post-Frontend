import { useEffect, useRef } from 'react'
import EditorJS, {type OutputData } from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Paragraph from '@editorjs/paragraph'
import ImageTool from '@editorjs/image'
import LinkTool from '@editorjs/link'
import Quote from '@editorjs/quote'
import Code from '@editorjs/code'
import Table from '@editorjs/table'

export type EditorProps = {
	value?: OutputData
	onChange?: (data: OutputData) => void
}

export function Editor({ value, onChange }: EditorProps) {
	const ref = useRef<EditorJS | null>(null)
	const holder = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		let destroyed = false
		async function init() {
			if (ref.current || !holder.current) return
			ref.current = new EditorJS({
				holder: holder.current,
				data: (value as any) || undefined,
				autofocus: true,
				placeholder: 'Write your story...',
				inlineToolbar: ['bold', 'italic', 'link'],
				tools: {
					header: Header,
					list: List,
					paragraph: Paragraph,
					linkTool: LinkTool,
					image: {
						class: ImageTool,
						config: {
							uploader: {
								uploadByFile: async (file: File) => {
									// NOTE: Adjust to real upload endpoint if needed
									const body = new FormData()
									body.append('image', file)
									// Return in Editor.js expected format
									return {
										success: 1,
										file: { url: URL.createObjectURL(file) },
									}
								},
							},
						},
					},
					quote: Quote,
					code: Code,
					table: Table,
				},
				onChange: async () => {
					if (!ref.current) return
					const data = await ref.current.save()
					onChange?.(data)
				},
			})
		}
		init()
		return () => {
			destroyed = true
			if (ref.current && !destroyed) {
				ref.current.destroy()
				ref.current = null
			}
		}
	}, [value, onChange])

	return <div className="min-h-[300px] border rounded-xl bg-white dark:bg-neutral-900"><div ref={holder} className="p-4" /></div>
}
