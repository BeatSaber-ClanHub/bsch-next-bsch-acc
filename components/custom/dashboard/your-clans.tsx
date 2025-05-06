import HorizontalScrollableClanCardDisplay from "@/components/custom/clan-scroller/horizontal-scrollable-clan-card-display";

// Joined clans
const YourClans = () => {
  return (
    <HorizontalScrollableClanCardDisplay
      apiRoute="/api/clans/owned?orderBy=createdAt&sortDirrection=desc"
      queryKey={["your_clans"]}
    />
  );
};

export default YourClans;
