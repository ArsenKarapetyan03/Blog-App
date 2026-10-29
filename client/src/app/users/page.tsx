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

const UsersPage = async ({searchParams}: UsersPageProps) => {
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

	const [usersRes, meRes] = await Promise.all([
		fetch(`${BASE_URL}/user?${params.toString()}`),
		fetch(`${BASE_URL}/user/me`, {
			headers: token ? {"Authorization": `Bearer ${token}`} : {},
			cache: "no-store"
		})
	]);

	if (!usersRes.ok || !meRes.ok) {
		console.error(`Failed to load users: ${usersRes.status} ${meRes.status}`);
		return <EmptyState />;
	}

	const [rawUsers, rawCurrentUser] = await Promise.all([
		usersRes.json(),
		meRes.json()
	]);

	if (!rawUsers.success || !rawCurrentUser.success) {
		return <EmptyState />;
	}

	const currentUser: UserType = rawCurrentUser.user;
	const friendIds = new Set(currentUser.friends?.map(f => f.id) || []);
	const incomingRequestIds = new Set(currentUser.incomingRequests?.map(user => user.id) || []);
	const outgoingRequestIds = new Set(currentUser.outgoingRequests?.map(user => user.id) || []);

	const users = rawUsers.users.filter((user: UserType) => currentUser.id !== user.id);
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

						{/*<Pagination currentPage={currentPage} totalPages={totalPages} />*/}
				</>
				}
			</div>
		</div>
	)
}

export default UsersPage;
