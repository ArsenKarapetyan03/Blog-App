import { cookies } from "next/headers";
import { BASE_URL } from "@/config/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserType } from "@/types/types";
import { UserRow } from "@/components/ui/UserRow";
import { Search } from "@/components/Search";
import Pagination from "@/components/Pagination";

interface UsersPageProps {
	searchParams: Promise<{
		page?: string;
		query?: string;
	}>;
}

const USER_PER_PAGE = 6;

const UsersPage = async ({ searchParams }: UsersPageProps) => {
	const resolvedParams = await searchParams;
	const query = resolvedParams.query?.trim().toLowerCase() || "";
	const token = (await cookies()).get("token")?.value;

	const requestedPage = Number(resolvedParams?.page);
	const currentPage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

	const params = new URLSearchParams({
		page: String(currentPage),
		limit: String(USER_PER_PAGE),
	});

	if (query) {
		params.set("query", query);
	}

	const usersRes = await fetch(`${BASE_URL}/user?${params.toString()}`);
	if (!usersRes.ok) {
		console.error(`Failed to load users: ${usersRes.status}`);
		return <EmptyState />;
	}

	const rawUsers = await usersRes.json();
	if (!rawUsers.success) {
		return <EmptyState />;
	}

	let currentUser: UserType | null = null;
	const friendIds = new Set<number>();
	const incomingRequestIds = new Set<number>();
	const outgoingRequestIds = new Set<number>();

	if (token) {
		try {
			const meRes = await fetch(`${BASE_URL}/user/me`, {
				headers: { "Authorization": `Bearer ${token}` },
				cache: "no-store"
			});

			if (meRes.ok) {
				const rawCurrentUser = await meRes.json();
				if (rawCurrentUser.success) {
					currentUser = rawCurrentUser.user;
					currentUser?.friends?.forEach(f => friendIds.add(f.id));
					currentUser?.incomingRequests?.forEach(u => incomingRequestIds.add(u.id));
					currentUser?.outgoingRequests?.forEach(u => outgoingRequestIds.add(u.id));
				}
			}
		} catch (error) {
			console.error("Failed to fetch current user profile", error);
		}
	}

	const users = currentUser
		? rawUsers.users.filter((user: UserType) => currentUser!.id !== user.id)
		: rawUsers.users;

	const totalPages: number = rawUsers.totalPages;

	return (
		<div>
			<div className="py-10 flex justify-end border-b border-slate-200">
				<Search />
			</div>

			<div className="py-5 flex flex-col gap-4">
				{users.length === 0
					? <EmptyState message="No users found" />
					: <>
						{users.map((user: UserType) => (
							<UserRow
								key={user.id}
								user={user}
								relationshipStatus={
									friendIds.has(user.id)
										? "accepted"
										: incomingRequestIds.has(user.id)
											? "incoming"
											: outgoingRequestIds.has(user.id)
												? "outgoing"
												: "none"
								}
							/>
						))}

						{totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
					</>
				}
			</div>
		</div>
	)
}

export default UsersPage;
