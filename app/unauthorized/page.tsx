export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-300">
          You do not have permission to view this page.
        </p>
      </div>
    </div>
  );
}
