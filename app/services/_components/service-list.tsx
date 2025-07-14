// PATCHED VERSION OF: ./app/services/_components/service-list.tsx

import { FC } from "react";
import { Item } from "./item";

// Define service type
interface ServiceType {
  _id: string;
  title: string;
  // Add additional fields here as needed
}

interface ServiceListProps {
  services: ServiceType[];
}

const ServiceList: FC<ServiceListProps> = ({ services }) => {
  return (
    <>
      {services.map((service: ServiceType) => (
        <div key={service._id}>
          <Item id={service._id} title={service.title} />
        </div>
      ))}
    </>
  );
};

export default ServiceList;