import { HStack, Select } from "@chakra-ui/react";

export default function AssistanceFilters({
  officeId,
  setOfficeId,
  subventionTypeId,
  setSubventionTypeId,
  officeOptions,
  isDisabled,
}: {
  officeId: string | number;
  setOfficeId: (v: string | number) => void;
  subventionTypeId: string | number;
  setSubventionTypeId: (v: string | number) => void;
  officeOptions: Array<{ id: string | number; name: string }>;
  isDisabled?: boolean;
}) {
  return (
    <HStack mb={4} spacing={3}>
      <Select
        value={String(officeId)}
        onChange={(e) => setOfficeId(Number(e.target.value))}
        maxW="260px"
        variant="filled"
        isDisabled={isDisabled}
      >
        {officeOptions.map((o) => (
          <option key={String(o.id)} value={String(o.id)}>
            {o.name}
          </option>
        ))}
      </Select>

      <Select
        value={String(subventionTypeId)}
        onChange={(e) => setSubventionTypeId(Number(e.target.value))}
        maxW="220px"
        variant="filled"
      >
      
      </Select>
    </HStack>
  );
}
