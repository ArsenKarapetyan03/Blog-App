export const InfoRow = (
	{
		name,
		createdAt
	}: {
		name: string,
		createdAt?: string
	}
) =>
	(
		<div className="flex flex-wrap items-center gap-4 text-inherit text-slate-500">
			<div className="flex-1 flex items-center gap-2 py-5">
				<span className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
					{name[0]}
				</span>

				<span className="font-semibold text-slate-600">{name}</span>
			</div>

			{createdAt && <time className="text-xs">{new Date(createdAt).toISOString().split("T")[0]}</time>}
		</div>
	)