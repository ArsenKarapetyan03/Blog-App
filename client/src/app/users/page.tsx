import { BASE_URL } from "@/config/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { User } from "@/types/types";
import { InfoRow } from "@/components/ui/InfoRow";

const UsersPage = async () => {
	const response = await fetch(`${BASE_URL}/user`);
	const result = await response.json();

	if (!result.success || !result.users?.length) {
		return <EmptyState />
	}

	const users: User[] = result.users;

	return (
		<div className="py-5 flex flex-col gap-4">
			{users.map((user: User) => (
				<div
					key={user.id}
					className="group relative flex items-center gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 transition-all duration-200 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-sm"
				>
					<div className="flex-1 min-w-0">
						<InfoRow name={user.name} />

						{user.email && (
							<p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
								{user.email}
							</p>
						)}
					</div>

					<div>

					</div>
				</div>
			))}
		</div>
	)
}

export default UsersPage;
