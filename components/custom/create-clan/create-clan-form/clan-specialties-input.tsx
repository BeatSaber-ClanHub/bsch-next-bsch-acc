import { colorClasses } from "@/components/types/clan-types";
import { ClanSpecialties } from "@/prisma/generated/prisma/client";
import { useState } from "react";

const ClanSpecialtiesInput = ({
  specialty,
  handleSelection,
}: {
  specialty: ClanSpecialties;
  handleSelection: (specialty: ClanSpecialties) => void;
}) => {
  const [isSelected, setIsSelected] = useState(false);

  // Sets the state and calls the handleSelection function
  function handleSpecialtySelection() {
    const newSelectionChoice = !isSelected;
    // Update the state for the component
    setIsSelected(newSelectionChoice);
    // Call the handleSelection function in the CreateClanForm. The logic is handled there
    handleSelection(specialty);
  }

  return (
    <div
      className={`w-full h-[40px] rounded-[2px] pl-2 flex items-center border-2 ${
        colorClasses[specialty]
      } ${isSelected ? "" : "!bg-transparent"} text-white`}
      onClick={handleSpecialtySelection}
    >
      <p>{specialty}</p>
    </div>
  );
};

export default ClanSpecialtiesInput;
