'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/spinner';

const EditServicePage = () => {
  const router = useRouter();
  const { servicesId } = useParams() as { servicesId: Id < 'services' > };
  
  const service = useQuery(api.services.getById, { id: servicesId });
  const updateService = useMutation(api.services.update);
  
  const [form, setForm] = useState({
    name: '',
    deliveryTime: '',
    price: '',
  });
  
  const [error, setError] = useState < string | null > (null);
  
  useEffect(() => {
    if (service) {
      setForm({
        name: service.name,
        deliveryTime: service.deliveryTime,
        price: service.price?.toString() ?? '',
      });
    }
  }, [service]);
  
  const handleChange = (e: React.ChangeEvent < HTMLInputElement > ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async () => {
    setError(null);
    try {
      await updateService({
        id: servicesId,
        name: form.name,
        deliveryTime: form.deliveryTime,
        price: parseFloat(form.price),
      });
      router.push('/services');
    } catch (err) {
      setError('Failed to update service.');
    }
  };
  
  if (service === undefined) {
    return (
      <div className="p-6">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (service === null) {
    return (
      <div className="p-6 text-red-600">
        Service not found.
      </div>
    );
  }
  
  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Service</h1>
      <div className="space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium">Service Name</label>
          <Input name="name" value={form.name} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium">Delivery Time</label>
          <Input name="deliveryTime" value={form.deliveryTime} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-sm font-medium">Price</label>
          <Input name="price" value={form.price} onChange={handleChange} />
        </div>
        <Button onClick={handleSubmit} disabled={updateService.isLoading}>
          {updateService.isLoading ? 'Updating...' : 'Update Service'}
        </Button>
      </div>
    </div>
  );
};

export default EditServicePage;