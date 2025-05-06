import Image, { ImageProps } from "next/image";

type BSCHLogoProps = Omit<ImageProps, "src" | "alt">;

const BSCHLogo = ({ width = 40, height = 40, ...props }: BSCHLogoProps) => {
  return (
    <div className="rounded-md w-10 h-10 overflow-hidden flex items-center justify-center bg-primary/50">
      <Image
        src="/images/bsch_logo.webp"
        alt="BSCH Logo"
        width={width}
        height={height}
        {...props}
      />
    </div>
  );
};

export default BSCHLogo;
