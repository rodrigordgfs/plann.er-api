import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");
dayjs.extend(localizedFormat);
dayjs.extend(utc);

export { dayjs };
