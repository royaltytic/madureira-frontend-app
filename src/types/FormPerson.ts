import { z } from "zod";
import { PersonScheme } from "../utils/PersonScheme";

export type FormPerson= z.infer<typeof PersonScheme>;