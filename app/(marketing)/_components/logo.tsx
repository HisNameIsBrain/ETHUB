import Image from "next/image";

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`hidden md:flex items-center gap-x-2 ${className}`}>
      <Image
        src="/logo.svg"
        height={100}
        width={100}
        alt="Logo"
        className="dark:hidden"
      />
      <Image
        src="/logo-dark.svg"
        height={100}
        width={100}
        alt="Logo"
        className="hidden dark:block"
      />
    </div>
  );
};
