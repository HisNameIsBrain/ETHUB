// app/services/[serviceId]/page.tsx
export default function ServiceDetail({ params }: { params: { serviceId: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Service ID: {params.serviceId}</h1>
      <p className="mt-2 text-gray-500 dark:text-gray-300">
        This is a detail view. Load service data here.
      </p>
    </div>
  );
}