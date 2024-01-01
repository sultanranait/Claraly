import dayjs from "dayjs";

export const formatDate = (
  v: string | Date | dayjs.Dayjs | number,
  format = "MMM DD, YYYY"
): string => dayjs(v).format(format);
