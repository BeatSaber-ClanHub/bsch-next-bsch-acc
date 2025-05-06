import HorizontalScrollableClanCardDisplay from "@/components/custom/clan-scroller/horizontal-scrollable-clan-card-display";

// Joined clans
const YourClans = () => {
  return (
    <HorizontalScrollableClanCardDisplay
      apiRoute="/api/clans/joined"
      queryKey={["joined_clans"]}
    />
  );
};

export default YourClans;
