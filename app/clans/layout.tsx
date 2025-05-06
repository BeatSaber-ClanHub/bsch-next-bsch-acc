import { ReactNode } from "react";

const ClansLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className=" max-w-[1600px] ml-auto mr-auto px-4 pt-4">{children}</div>
  );
};

export default ClansLayout;
