'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/spinner';
import { TextArea } from '@/components/ui/TextArea'; // Ensure file and export match

const EditServicePage = () => {
  const router = useRouter();
  const { serviceId } = useParams() as { serviceId: string };
  
  const service = useQuery(api.services.getById, { id: serviceId });
  const updateService = useMutation(api.services.update);
  
  const [form, setForm] = useState({
    name: '',
    deliveryTime: '',
    price: '',
    category: '',
    description: '',
    server: '',
  });
  
  const [error, setError] = useState < string | null > (null);
  
  useEffect(() => {
    if (service) {
      setForm({
        name: service.name,
        deliveryTime: service.deliveryTime,
        price: service.price?.toString() ?? '',
        category: service.category ?? '',
        description: service.description ?? '',
        server: service.server ?? '',
      });
    }
  }, [service]);
  
  const handleChange = (
    e: React.ChangeEvent < HTMLInputElement | HTMLTextAreaElement >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async () => {
    setError(null);
    try {
      await updateService({
        id: serviceId,
        name: form.name,
        deliveryTime: form.deliveryTime,
        price: parseFloat(form.price),
        category: form.category,
        description: form.description,
        server: form.server,
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
    return <div className="p-6 text-red-600">Service not found.</div>;
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
        
        <div>
          <label className="block text-sm font-medium">Category</label>
          <Input name="category" value={form.category} onChange={handleChange} />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Server Code</label>
          <Input name="server" value={form.server} onChange={handleChange} />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Description</label>
          <TextArea name="description" value={form.description} onChange={handleChange} />
        </div>
        
        <Button onClick={handleSubmit} disabled={updateService.isLoading}>
          {updateService.isLoading ? 'Updating...' : 'Update Service'}
        </Button>
      </div>
    </div>
  );
};

export default EditServicePage;