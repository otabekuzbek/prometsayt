import { createHouse } from "../../lib/house3d";
(window as unknown as { createHouse: typeof createHouse }).createHouse = createHouse;
