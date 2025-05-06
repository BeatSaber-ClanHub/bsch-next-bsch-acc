import { ReviewStatus } from "@/prisma/generated/prisma/client";
import { Badge } from "../../ui/badge";

const AppealStatusBadge = ({ status }: { status: ReviewStatus }) => {
  const appeal_status: ReviewStatus = status;
  const colorMap: Record<ReviewStatus, string> = {
    Approved: "bg-green-500",
    Denied: "bg-red-500",
    In_Review: "bg-yellow-500",
    Submitted: "bg-primary",
  };

  return (
    <Badge className={`${colorMap[appeal_status]} w-fit`}>
      {appeal_status.replace("_", " ")}
    </Badge>
  );
};

export default AppealStatusBadge;
