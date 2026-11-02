import "server-only";
import { cache } from "react";
import { getContent } from "./store";

/** Bitta so'rov davomida kontentni bir marta o'qiydi */
export const content = cache(getContent);
