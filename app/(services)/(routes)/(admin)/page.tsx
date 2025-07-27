import { useUser } from "@clerk/nextjs";

export default function AdminPage() {
  const { user } = useUser();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-300">
        Welcome, {user?.firstName || user?.emailAddresses[0].emailAddress}
      </p>
    </div>
  );
}
