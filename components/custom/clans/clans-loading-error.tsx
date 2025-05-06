import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ClansLoadingError = () => {
  return (
    <Alert className="w-full sm:w-auto">
      <AlertCircle />
      <AlertTitle>Uh Oh!</AlertTitle>
      <AlertDescription>There was an issue loading clan data!</AlertDescription>
    </Alert>
  );
};

export default ClansLoadingError;
