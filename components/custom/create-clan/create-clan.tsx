import CreateClanDialog from "@/components/custom/create-clan/create-clan-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CreateClan = () => {
  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>Get started!</CardTitle>
        <CardDescription>
          Click the button below to get started with your new clan!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CreateClanDialog />
      </CardContent>
    </Card>
  );
};

export default CreateClan;
