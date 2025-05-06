import ClanSpecialtiesInput from "@/components/custom/create-clan/create-clan-form/clan-specialties-input";
import { colorClasses } from "@/components/types/clan-types";
import { ClanSpecialties } from "@/prisma/generated/prisma/client";

const ClanSpecialtySelection = ({
  handleSelection,
}: {
  handleSelection: (specialty: ClanSpecialties) => void;
}) => {
  return Object.keys(colorClasses).map((specialty, index) => {
    return (
      <ClanSpecialtiesInput
        key={index}
        specialty={specialty as ClanSpecialties}
        handleSelection={handleSelection}
      />
    );
  });
};

export default ClanSpecialtySelection;
