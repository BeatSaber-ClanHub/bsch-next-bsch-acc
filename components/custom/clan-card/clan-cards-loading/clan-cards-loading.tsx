import ClanCardLoading from "@/components/custom/clan-card/clan-cards-loading/clan-card-loading";

// Loading state layout
const ClanCardsLoading = ({
  orientation = "horizontal",
}: {
  orientation?: "horizontal" | "vertical";
}) => {
  return (
    <>
      <ClanCardLoading orientation={orientation} />
      <ClanCardLoading orientation={orientation} />
      <ClanCardLoading orientation={orientation} />
      <ClanCardLoading orientation={orientation} />
    </>
  );
};

export default ClanCardsLoading;
