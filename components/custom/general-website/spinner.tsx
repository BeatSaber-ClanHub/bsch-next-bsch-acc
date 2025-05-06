import { Loader, LucideProps } from "lucide-react";

const Spinner = (props: LucideProps) => {
  return (
    <div className="animate-spin duration-1000 relative">
      <Loader {...props} />
    </div>
  );
};

export default Spinner;
