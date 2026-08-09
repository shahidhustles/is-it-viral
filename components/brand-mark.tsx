import Image from "next/image";

export function BrandMark({ className = "size-8" }: { className?: string }) {
  return <Image alt="" aria-hidden="true" className={className} height={32} priority src="/icon.png" width={32} />;
}
