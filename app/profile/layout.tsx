import { ReactNode } from "react";

const ProfileLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="max-w-[1600px] ml-auto mr-auto px-4 py-4">{children}</div>
  );
};

export default ProfileLayout;
