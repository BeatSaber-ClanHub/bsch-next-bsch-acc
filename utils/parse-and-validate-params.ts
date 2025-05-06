import qs from "qs";
import { z } from "zod";

function parseAndValidateQueryParams({
  schema,
  url,
}: {
  schema: z.AnyZodObject;
  url: string;
}): Record<string | number | symbol, unknown> {
  const urlParams = qs.parse(url.split("?")[1]);
  const { success, data } = schema.safeParse(urlParams);
  let filters: Record<string | number | symbol, unknown> = data || {};

  if (!success) {
    type ParamsType = z.infer<typeof schema>;
    const validParams = Object.entries(urlParams).reduce(
      (acc, [key, value]) => {
        if (key in schema.shape) {
          const keyAsSchemaKey = key as keyof ParamsType;
          const fieldSchema = schema.shape[keyAsSchemaKey];
          const validation = fieldSchema.safeParse(value);
          if (validation.success) {
            (acc[keyAsSchemaKey as string] as string | undefined | number) =
              validation.data;
          }
        }
        return acc;
      },
      {} as Partial<ParamsType>
    );
    filters = validParams;
  }

  return filters;
}

export default parseAndValidateQueryParams;
