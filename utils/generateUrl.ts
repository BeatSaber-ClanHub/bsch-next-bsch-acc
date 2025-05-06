const generateUrl = (
  baseUrl: string,
  params: Record<string, string | number | boolean | null | undefined>
) => {
  const url = new URL(baseUrl);
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "object") {
      const v = value as unknown as Array<string>;
      let temp = "";
      v.map((val, index) => (temp += val + (index < v.length ? ";" : "")));
      searchParams.append(key, temp);
    }
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  });

  url.search = searchParams.toString();
  return url.toString();
};

export default generateUrl;
